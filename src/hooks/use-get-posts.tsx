import axios from 'axios';
import { ethers } from 'ethers';
import { useState, useEffect } from "react";
import { contractAddress } from '../settings/contants';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';

export type Post = {
  id: string;
  owner: string;
  price: string;
  text: string;
  originalOwner: string;
}

export default function useGetPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const abi = [
    "function purchase(uint256 postId) public payable",
    "function post(string memory text, uint256 price) public"
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const data = await axios.get('/posts');
    const result = JSON.parse(data.data);
    setPosts(result);
  }

  async function createPost(text: string, price: string) {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
        }
      },
    });
    const instance = await web3Modal.connect();
    const provider = new ethers.BrowserProvider(instance);
    const signer = await provider.getSigner();
    const smartContract = new ethers.Contract(contractAddress, abi, provider);
    const contractWithSigner = smartContract.connect(signer);

    const tx = await contractWithSigner.getFunction('post')(text, ethers.parseEther(price));
    await tx.wait();
    fetchPosts();
  }

  async function buyPost(index: number) {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
        }
      },
    });
    const instance = await web3Modal.connect();
    const provider = new ethers.BrowserProvider(instance);
    const signer = await provider.getSigner();
    const smartContract = new ethers.Contract(contractAddress, abi, provider);
    const contractWithSigner = smartContract.connect(signer);

    const tx = await contractWithSigner.getFunction('purchase')(posts[index].id, { value: posts[index].price });
    await tx.wait();
    fetchPosts();
  }

  return {
    posts,
    createPost,
    buyPost
  };
}
