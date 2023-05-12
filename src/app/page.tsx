'use client';

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Wallet, ethers } from 'ethers';
import useGetPosts, { Post } from '../hooks/use-get-posts';
import { shortenAddress } from '../utils/shorten-address';

export default function Home() {
  const { posts, createPost, buyPost } = useGetPosts();
  const [input, setInput] = useState("");
  const [price, setPrice] = useState("");
  const [connectedAddress, setConnectedAddress] = useState('');

  const checkConnection = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      return;
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      setConnectedAddress(accounts[0]);
    } else {
      setConnectedAddress('');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (!posts) {
    return <div />;
  }

  function sendPost() {
    if (!input || !price) return;
    createPost(input, price);
    setInput("");
    setPrice("");
  }

  return (
    <main className="bg-white h-full p-5 flex flex-col gap-10">
      <div className='flex flex-col gap-10'>
        <div className='flex justify-between align-center'>
          <h1 className='block font-sans text-5xl font-semibold'>ETH Social Dapp</h1>
          {connectedAddress && <p className='block font-sans text-xl'>Connected to: {shortenAddress(connectedAddress)}</p>}
        </div>
        <div className='flex flex-col gap-4 max-w-md'>
          <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3" placeholder='Content' value={input} onChange={(e) => setInput(e.target.value)} />
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3" type="number" placeholder='Price' value={price} onChange={(e) => setPrice(e.target.value)} />
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={sendPost}>
            Post
          </button>
        </div>
      </div>
      <div className='flex flex-wrap gap-4 p-1 w-full'>
        {posts.map((post: Post, index: number) => (
          <div key={post.id} className="relative flex w-96 flex-col rounded-xl bg-white bg-clip-border bg-gray-100 p-3 gap-8">
            <div>
              <p className="block font-sans text-base">
                {post.text}
              </p>
              <hr className='my-2' />
              <p className="text-gray-500">Owner: {shortenAddress(post.owner)}</p>
              <p className="text-gray-500">Original Owner: {shortenAddress(post.originalOwner)}</p>
            </div>

            <div className="flex justify-between align-center">
              <button className="rounded-md bg-green-300 py-1 px-2 text-center" onClick={() => buyPost(index)}>
                Buy
              </button>
              <strong className="block font-sans text-base">
                {`${ethers.formatEther(post.price)} ETH`}
              </strong>

            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
