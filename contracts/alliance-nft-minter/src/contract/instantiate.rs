use super::reply::INSTANTIATE_REPLY_ID;
use crate::state::{CONFIG, STATS};
use alliance_nft_packages::{
    errors::ContractError,
    instantiate::{InstantiateCollectionMsg, InstantiateMinterMsg}, state::{MinterConfig, MinterStats},
};
use cosmwasm_std::{
    entry_point, to_binary, DepsMut, Env, MessageInfo, Reply, Response, StdError, SubMsg, WasmMsg,
};
use cw2::set_contract_version;

pub const CONTRACT_NAME: &str = "crates.io:alliance-nft-minter";
pub const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMinterMsg,
) -> Result<Response, ContractError> {

    if msg.mint_start_time > msg.mint_end_time {
        return Err(ContractError::InvalidMintTimeRange{});
    }

    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)
        .map_err(ContractError::Std)?;

    STATS.save(deps.storage, &MinterStats::default())?;
    
    // Create the default partial config
    CONFIG.save(deps.storage, 
        &MinterConfig::new_partial(
            info.sender.clone(), 
            msg.dao_address.clone(),
            msg.dao_treasury_address.clone(),
            msg.mint_start_time, 
            msg.mint_end_time
        )
    )?;

    // instantiate the nft contract
    let instantiate_message = WasmMsg::Instantiate {
        admin: Some(env.contract.address.to_string()),
        code_id: msg.nft_collection_code_id,
        msg: to_binary(&InstantiateCollectionMsg {
            name: "AllianceDAO".to_string(),
            symbol: "ALLIANCE".to_string(),
            minter: env.contract.address.to_string(),
            owner: msg.dao_address, 
        })?,
        funds: info.funds,
        label: "Alliance NFT Collection".to_string(),
    };
    let sub_msg = SubMsg::reply_on_success(instantiate_message, INSTANTIATE_REPLY_ID);

    Ok(Response::new()
        .add_attribute("alliance_nft_minter_owner", info.sender)
        .add_attribute("mint_start_time", msg.mint_start_time.to_string())
        .add_attribute("mint_end_time", msg.mint_end_time.to_string())
        .add_submessage(sub_msg))
}

pub fn reply_on_instantiate(
    deps: DepsMut,
    reply: Reply,
) -> Result<Response, ContractError> {
    let result = reply.result.into_result().map_err(StdError::generic_err)?;
    /* Find the event type instantiate which contains the contract_address*/
    let event = result
        .events
        .iter()
        .find(|event| event.ty == "instantiate")
        .ok_or_else(|| StdError::generic_err("cannot find `instantiate` event"))?;

    /* Find the contract_address from instantiate event*/
    let contract_addr = &event
        .attributes
        .iter()
        .find(|attr| attr.key == "_contract_address")
        .ok_or_else(|| StdError::generic_err("cannot find `_contract_address` attribute"))?
        .value;

    let contract_addr = deps.api.addr_validate(&contract_addr)?;
    CONFIG.update(deps.storage, |mut config| -> Result<_, ContractError> {
        config.nft_collection_address = contract_addr;
        Ok(config)
    })?;

    Ok(Response::default())
}