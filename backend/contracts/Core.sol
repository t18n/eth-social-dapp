pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SocialDapp is ERC721 {
    uint256 id;

    struct Post {
        address originalPoster;
        uint256 price;
        string text;
        uint256 id;
    }

    mapping(uint256 => Post) idToPost;

    constructor() ERC721("ETH-SOCIAL-DAPP-NFT", "SDP") {
        id = 0;
    }

    /**
     * Create a post as am NFT
     */
    function post(string memory text, uint256 price) external {
        _mint(msg.sender, id);
        idToPost[id] = Post(msg.sender, price, text, id);
        id++;
    }

    /**
     * Get a list of all posts
     */
    function getPosts() public view returns (Post[] memory, address[] memory) {
        Post[] memory posts = new Post[](id);
        address[] memory owners = new address[](id);
        for (uint256 i = 0; i < id; i++) {
            Post memory p = idToPost[i];
            posts[i] = Post(p.originalPoster, p.price, p.text, p.id);
            owners[i] = ownerOf(i);
        }
        return (posts, owners);
    }

    /**
     * Purchase a post as a non-owner
     */
    function purchase(uint256 postId) external payable {
        Post memory targetPost = idToPost[postId];
        require(
            targetPost.originalPoster != address(0),
            "Error: Post does not exist"
        );
        require(msg.value >= targetPost.price, "Purchase price not met");

        // Transfer ownership and pay royalties
        uint256 royalty = (msg.value * 500) / 10000;
        payable(targetPost.originalPoster).call{value: royalty};
        payable(ownerOf(postId)).call{value: msg.value - royalty};
        _transfer(ownerOf(postId), msg.sender, postId);
    }
}
