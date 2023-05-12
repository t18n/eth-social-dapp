import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { contractAddress, ethEndpoint } from "../../settings/contants";
import { Post } from "../../hooks/use-get-posts";

export async function GET() {
  const provider = ethers.getDefaultProvider(ethEndpoint);
  const abi = ["function getPosts() public view returns(tuple(address,uint256,string,uint256)[] memory, address[] memory)"];

  const smartContract = new ethers.Contract(contractAddress, abi, provider);
  const result = await smartContract.getPosts();

  // Format the result to append the original owner to each post
  const posts: Post[] = convertToPosts(result[0].map((post: unknown[], index: number) => {
    return [...post, result[1][index]];
  }));

  return NextResponse.json(serializeResult(posts));
}

function serializeResult(data: unknown) {
  return JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v));
}

function convertToPosts(data: string[][]): Post[] {
  return data.map((post) => ({
    originalOwner: post[0],
    price: post[1],
    text: post[2],
    id: post[3],
    owner: post[4],
  }));
}