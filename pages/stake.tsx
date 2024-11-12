import {
  ConnectWallet,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useContractRead,
  useOwnedNFTs,
  useTokenBalance,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Image from 'next/image';
import NFTCard from "../components/NFTCard";
import {
  nftDropContractAddress,
  stakingContractAddress,
  tokenContractAddress,
} from "../consts/contractAddresses";
import styles from "../styles/Home.module.css";

const Stake: NextPage = () => {
  const address = useAddress();
  const { contract: nftDropContract } = useContract(
    nftDropContractAddress,
    "nft-drop"
  );
  const { contract: tokenContract } = useContract(
    tokenContractAddress,
    "token"
  );
  const { contract, isLoading } = useContract(stakingContractAddress);
  const { data: ownedNfts, error: nftError } = useOwnedNFTs(nftDropContract, address);
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
  const { data: stakedTokens } = useContractRead(contract, "getStakeInfo", [
    address,
  ]);

  useEffect(() => {
    if (nftError) {
      console.log("NFT Error:", nftError);
    }
    if (ownedNfts) {
      console.log("Owned NFTs:", ownedNfts);
    }
  }, [ownedNfts, nftError]);

  useEffect(() => {
    if (!contract || !address) return;

    async function loadClaimableRewards() {
      const stakeInfo = await contract?.call("getStakeInfo", [address]);
      setClaimableRewards(stakeInfo[1]);
    }

    loadClaimableRewards();
  }, [address, contract]);

  async function stakeNft(id: string) {
    if (!address) return;

    const isApproved = await nftDropContract?.isApproved(
      address,
      stakingContractAddress
    );
    if (!isApproved) {
      await nftDropContract?.setApprovalForAll(stakingContractAddress, true);
    }
    await contract?.call("stake", [[id]]);
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Stake NFTs for &apos;PERKS&apos;</h1>
      <div style={{ padding: "5px 0" }}>
        <Image
          src="/icons/PERKS.png"
          alt="PIXEL WORLD Staking"
          width={100}
          height={100}
          priority
        />
      </div>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {!address ? (
        <ConnectWallet
          theme="dark"
          btnTitle="Connect Wallet"
          hideTestnetFaucet={true}
          modalTitle="PIXEL WORLD"
          modalSize="wide"
          welcomeScreen={{
            title: "PIXEL WORLD Staking",
            subtitle: "Connect your wallet to stake"
          }}
          modalTitleIconUrl="/icons/globeski.png"
          termsOfServiceUrl="https://www.mrbriandesign.com/terms"
          auth={{
            loginOptional: true
          }}
        />
      ) : (
        <>
          <h2 className={styles.heading2}>Your Tokens</h2>
          <div className={styles.tokenGrid}>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Claimable Rewards</h3>
              <p className={styles.tokenValue}>
                <b>
                  {!claimableRewards
                    ? "Loading..."
                    : ethers.utils.formatUnits(claimableRewards, 18)}
                </b>{" "}
                {tokenBalance?.symbol}
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Current Balance</h3>
              <p className={styles.tokenValue}>
                <b>{tokenBalance?.displayValue}</b> {tokenBalance?.symbol}
              </p>
            </div>
          </div>

          <div className={styles.centerButton}>
            <Web3Button
              action={(contract) => contract.call("claimRewards")}
              contractAddress={stakingContractAddress}
            >
              Claim Rewards
            </Web3Button>
          </div>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2 className={styles.heading2}>Your Staked NFTs</h2>
          <div className={styles.nftBoxGrid}>
            {stakedTokens &&
              stakedTokens[0]?.map((stakedToken: BigNumber) => (
                <NFTCard
                  tokenId={stakedToken.toNumber()}
                  key={stakedToken.toString()}
                />
              ))}
          </div>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2 className={styles.heading2}>Your Unstaked NFTs</h2>
          <div className={styles.nftBoxGrid}>
            {ownedNfts?.map((nft) => (
              <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMedia}
                />
                <h3>{nft.metadata?.name || "Unnamed NFT"}</h3>
                <div className={styles.centerButton}>
                  <Web3Button
                    contractAddress={stakingContractAddress}
                    action={() => stakeNft(nft.metadata.id)}
                  >
                    Stake
                  </Web3Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Stake;