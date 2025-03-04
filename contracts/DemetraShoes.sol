// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract DemetraShoes is ERC721, VRFConsumerBaseV2Plus {
    using VRFV2PlusClient for VRFV2PlusClient.RandomWordsRequest;
    error InvalidRequestId();
    error MintFailed();
    error NotTokenOwnerOrApproved();
    error TransferFailed();

    uint256 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    bytes32 private immutable i_gasLane;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    uint256 public constant MINT_PRICE = 0.001 ether;
    uint256 public constant MAX_SUPPLY = 10; 
    uint256 private s_tokenCounter;
    
    struct DemetraShoe {
        uint256 randomNumber;
        uint256 durability;
        uint256 comfort;
        uint256 sustainability;
        uint256 biodegradability;
    }

    mapping(uint256 => DemetraShoe) public tokenAttributes;
    mapping(uint256 => address) private s_requestIdToSender;
    mapping(uint256 => bool) public goldenTicketWinners;
    mapping(uint256 => uint256) public tokenDiscounts; // Mappatura per sconto NFT
    mapping(uint256 => string) private _tokenURIs; // Mapping per gli URI

    event NFTRequested(uint256 indexed requestId, address requester);
    event NFTMinted(uint256 indexed tokenId, address minter, DemetraShoe attributes);
    event RandomnessFulfilled(uint256 requestId, uint256[] randomWords);
    event GoldenPassAwarded(uint256 indexed tokenId, address indexed winner);
    event PreMint(address to, uint256 tokenId);
    event PostMint(address to, uint256 tokenId);

    constructor(
        address vrfCoordinator,
        bytes32 gasLane,
        uint256 subscriptionId,
        uint32 callbackGasLimit
    ) 
        ERC721("DemetraShoe", "DMS") 
        VRFConsumerBaseV2Plus(vrfCoordinator)
    {
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_tokenCounter = 0;
    }

    function getCurrentTokenCount() public view returns (uint256) {
        return s_tokenCounter;
    }

    function requestNFT() public payable returns (uint256 requestId) {
        require(msg.value >= MINT_PRICE, "Not enough ETH sent");
        require(s_tokenCounter < MAX_SUPPLY, "Max supply reached");

        VRFV2PlusClient.RandomWordsRequest memory request = VRFV2PlusClient.RandomWordsRequest({
            keyHash: i_gasLane,
            subId: i_subscriptionId,
            requestConfirmations: REQUEST_CONFIRMATIONS,
            callbackGasLimit: i_callbackGasLimit,
            numWords: NUM_WORDS,
            extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
        });

        requestId = s_vrfCoordinator.requestRandomWords(request);
        s_requestIdToSender[requestId] = msg.sender;
        emit NFTRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        address nftOwner = s_requestIdToSender[requestId];
        if (nftOwner == address(0)) revert InvalidRequestId();
        require(s_tokenCounter < MAX_SUPPLY, "Max supply reached in callback");

        emit RandomnessFulfilled(requestId, randomWords);

        uint256 tokenId = s_tokenCounter;
        DemetraShoe memory attributes = randomizeShoe(randomWords[0]);
        tokenAttributes[tokenId] = attributes;
        
        
        uint256 discount = calculateDiscount(tokenId);
        tokenDiscounts[tokenId] = discount;

        // URI per il token
        string memory localtokenURI = generateTokenURI(tokenId);
        _tokenURIs[tokenId] = localtokenURI;

        emit PreMint(nftOwner, tokenId);
        _mint(nftOwner, tokenId);
        s_tokenCounter++;

        emit PostMint(nftOwner, tokenId);
        emit NFTMinted(tokenId, nftOwner, attributes);

        if (randomWords[0] % 50 == 0) { // 1 su 50 NFT riceve il Golden Pass
            goldenTicketWinners[tokenId] = true;
            emit GoldenPassAwarded(tokenId, nftOwner);
        }

        delete s_requestIdToSender[requestId];
    }

    
    function calculateDiscount(uint256 tokenId) public view returns (uint256) {
        DemetraShoe memory attributes = tokenAttributes[tokenId];
        
        uint256 discount = 0;
        
        
        if (attributes.durability >= 80) {
            discount += 10; 
        }

        
        if (attributes.comfort >= 75) {
            discount += 5;
        }

        
        if (attributes.sustainability >= 90) {
            discount += 5;
        }

        
        if (attributes.biodegradability >= 85) {
            discount += 5;
        }

        
        if (discount > 20) {
            discount = 20;
        }

        return discount;
    }

    function generateTokenURI(uint256 tokenId) private pure returns (string memory) {
        string memory baseURI = "https://api.example.com/metadata/"; // URI per i metadati
        return string(abi.encodePacked(baseURI, Strings.toString(tokenId)));
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenMinted(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function randomizeShoe(uint256 randomNumber) private pure returns (DemetraShoe memory) {
        return DemetraShoe({
            randomNumber: randomNumber,
            durability: (randomNumber % 100) + 1,
            comfort: ((randomNumber >> 100) % 100) + 1,
            sustainability: ((randomNumber >> 200) % 100) + 1,
            biodegradability: ((randomNumber >> 300) % 100) + 1
        });
    }

    function getTokenAttributes(uint256 tokenId) public view returns (DemetraShoe memory) {
        if(!tokenMinted(tokenId)) revert("Token does not exist");
        return tokenAttributes[tokenId];
    }

    function getNFTDiscount(uint256 tokenId) public view returns (uint256) {
        if (!tokenMinted(tokenId)) revert("Token does not exist");
        return tokenDiscounts[tokenId];
    }

    function tokenMinted(uint256 tokenId) internal view returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    function burnNFT(uint256 tokenId) public {
        if(ownerOf(tokenId) != msg.sender && getApproved(tokenId) != msg.sender) 
            revert NotTokenOwnerOrApproved();
        delete tokenAttributes[tokenId];
        _burn(tokenId);
    }
}
