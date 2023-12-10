import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useWallet } from "@terra-money/wallet-kit"
import ConfettiExplosion from "react-confetti-explosion"
import { ReactComponent as Logo } from "assets/AllianceDAOLogo.svg"
import { ReactComponent as CheckIcon } from "assets/check.svg"
import { AnimatedBackground } from "components/background/AnimatedBackground"
import styles from "./ConnectModalPage.module.scss"
import useAllianceContracts from "hooks/useAllianceContracts"
import { useAppContext } from "contexts"

export const ClaimModalPage = () => {
  const [claimStatus, setClaimStatus] = useState<
    "notClaimed" | "claimed" | "error"
  >("notClaimed")
  const [claimAvailable, setClaimAvailable] = useState<boolean>(false)

  const { walletAddress } = useAppContext()
  const { getNFTDataFromMinter } = useAllianceContracts(walletAddress)
  const wallet = useWallet()

  /**
   * Check if user has claimable NFTs on load
   * If user is not connected or if they already claimed, no claim is available.
   */
  useEffect(() => {
    const getNFTData = async () => {
      const nftData = await getNFTDataFromMinter()
      if (nftData !== undefined) {
        setClaimAvailable(true)
      }
    }
    getNFTData()
  }, [getNFTDataFromMinter])

  if (claimStatus === "claimed") {
    return (
      <div className={styles.full__page}>
        <AnimatedBackground />
        <ConfettiExplosion
          force={0.85}
          duration={2500}
          particleCount={80}
          width={1200}
          height={1200}
          colors={[
            "#3AB44C",
            "#EC5B25",
            "#E9AD5F",
            "#03AEEE",
            "#06E2D2",
            "#2F3288",
            "#912A8F",
            "#D7DE26",
            "#D91F5E",
          ]}
          className={styles.confetti}
        />
        <div className={styles.modal}>
          <div className={styles.logo__wrapper}>
            <CheckIcon
              className={styles.check__icon}
              fill="var(--token-primary-500)"
            />
          </div>
          <div className={styles.text}>
            <div className={styles.text}>You claimed 2 Alliance DAO NFTs!</div>
          </div>
          <div className={styles.button__wrapper}>
            <Link to="/" style={{ width: "100%" }}>
              <button className={styles.primary__button}>Done</button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleClaimClicked = () => {
    setTimeout(() => {
      setClaimStatus("claimed")
    }, 1000)
  }

  const handleConnectClick = () => {
    if (walletAddress) {
      wallet.disconnect()
    } else {
      wallet.connect()
    }
  }

  return (
    <div className={styles.full__page}>
      <AnimatedBackground />
      <div className={styles.modal}>
        <div className={styles.logo__wrapper}>
          <Logo className={styles.logo} />
        </div>
        {/** Wallet Not connected? render connect */}
        {!walletAddress ? (
          <div>
            <div className={styles.text}>
              <div className={styles.text}>
                Please connect to check your claimable NFT
              </div>
            </div>
            <div className={styles.button__wrapper}>
              <button
                className={styles.primary__button}
                onClick={handleConnectClick}
              >
                Connect Wallet
              </button>

              <Link to="/nft-gallery" style={{ width: "100%" }}>
                <button className={styles.secondary__button}>Cancel</button>
              </Link>
            </div>
          </div>
        ) : claimAvailable ? (
          /** Wallet Connected - Claim available  */
          <div>
            <div className={styles.text}>
              <div className={styles.text}>
                You have a claimable Alliance DAO NFT, click below to claim!
              </div>
            </div>
            <div className={styles.button__wrapper}>
              <button
                className={styles.primary__button}
                onClick={handleClaimClicked}
              >
                Claim NFTs
              </button>

              <Link to="/" style={{ width: "100%" }}>
                <button className={styles.secondary__button}>Cancel</button>
              </Link>
            </div>
          </div>
        ) : (
          /** Wallet Connected - No Claim Available */
          <div>
            <div className={styles.text}>
              <div className={styles.text}>
                This wallet is not eligible for the Game Of Alliance airdrop.
                Follow @AllianceDAO for opportunities to purchase an Alliance
                NFT.
              </div>
            </div>
            <div className={styles.button__wrapper}>
              <Link to="/nft-gallery" style={{ width: "100%" }}>
                <button className={styles.primary__button}>
                  View Full NFT Gallery
                </button>
              </Link>
            </div>
          </div>
        )}

        {/** Wallet Connected - Claim success? Confetti! */}
      </div>
    </div>
  )
}
