# Alliance NFT Collection

Reward NFT collection to the participants from [Game Of Alliance](https://docs.alliance.terra.money/game-of-alliance/overview/) that helped to test the [Alliance module](https://github.com/terra-money/alliance). Each NFT will receive staking rewards from Terra Blockchain and will also enable voting in the Alliance DAO.

## Collection Spec

This NFT contract will airdrop a total of 9,538 card-shaped collectibles using the [CW721 with Metadata Onchain](https://github.com/CosmWasm/cw-nfts/tree/main/contracts/cw721-metadata-onchain). Each collectible will be overlayed with the AllianceDAO logo. Below the logo, 1 of 11 constellation designs will be chosen from and overlayed on each NFT, depending on an address’s GOA score. 1 is lowest rarity, 11 is highest rarity which is calculated with the following formula: **(points from actions) * (√staking rewards)**. 

> If an IP has multiple addresses associated it will sum the points from actions and assign them to the wallet with more score associated to that IP.
> 

Metadata object will have the following properties:

- `image`: alliance NFT mural image url,
- `image_data`: alliance NFT image url,
- `attributes` represents the coordinates on the bigger Alliance mural image.
    - **x**: position in the Cartesian plane
    - **y**: position in the Cartesian plane
    - **width**: image width in pixels
    - **height**: image height in pixels
    - **rarity**: constellation rarity

> The following two properties will be appended to the attributes but they will be stored into a different storage.
> 
> - **broken**: when the nft is broken this property will be send as true,
> - **rewards**: amount of uluna accumulated by the NFT (e.g. 1000000uluna)
- Example of the NFT properties
    
    ```
    {
      "name": "AllianceNFT # 1",
      "token_uri": null,
      "extension": {
        "image": "https://ipfs.io/ipfs/....",
        "image_data": "https://ipfs.io/ipfs/....", 
        "external_url": null,
        "description": "Received for participating on Game Of Alliance",
        "name": "AllianceNFT # 1",
        "attributes": [{
    			"display_type" : null,
    			"trait_type": "x",
    			"value": "1"
    		},{
    			"display_type" : null,
    			"trait_type": "y",
    			"value": "1"
    		},{
    			"display_type" : null,
    			"trait_type": "width",
    			"value": "120"
    		},{
    			"display_type" : null,
    			"trait_type": "height",
    			"value": "120"
    		},{
    			"display_type" : null,
    			"trait_type": "rarity",
    			"value": 11
    		}],
        "background_color": null,
        "animation_url": null,
        "youtube_url": null
      }
    }
    ```
## NFT economics

The NFT collection will have an amount of tokens staked in the Alliance module to redirect a percentage of Luna inflation to the NFT collection. Each NFT will receive rewards only when is not broken. The only way to collect the accumulated rewards from the NFT is by “breaking it” and it can be broken only by the NFT owner. When an NFT is broken the rewards of the unbroken NFTS will be boosted because there is 1 less nft that gets rewards. When a user transfers the NFT the accumulated rewards are tied to the NFT.

Rewards redirection: 

- each NFT can claim 1/x of the rewards in the contract account.
- x= # of live NFTs that are staked (at genesis, x= 9,538).
- every time an NFT is broken (and rewards are claimed) X is smaller (never smaller than 0).
- when an NFT is forged back from being broken X gets greater (it can’t be greater than 9,538).
