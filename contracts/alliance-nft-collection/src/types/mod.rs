pub mod execute;
pub mod instantiate;
pub mod query;

use crate::state::Metadata;
use cosmwasm_std::Empty;

pub type AllianceNftCollection<'a> = cw721_base::Cw721Contract<'a, Extension, Empty, Empty, Empty>;
pub type Extension = Metadata;
