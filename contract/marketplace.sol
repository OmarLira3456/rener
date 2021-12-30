// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Rent {
    uint256 internal productsLength = 0;
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Product {
        address payable owner;
        string name;
        string image;
        string description;
        string date;
        uint256 price;
    }

    mapping(address => uint256[]) internal created;

    mapping(address => uint256[]) internal rented;

    mapping(uint256 => Product) internal products;

    function addProduct(
        string memory _name,
        string memory _image,
        string memory _description,
        string memory _date,
        uint256 _price
    ) public {
        products[productsLength] = Product(
            payable(msg.sender),
            _name,
            _image,
            _description,
            _date,
            _price
        );
        created[msg.sender].push(productsLength);
        productsLength++;
    }

    function editProduct(
        uint256 _index,
        string memory _name,
        string memory _image,
        string memory _description,
        string memory _date,
        uint256 _price
    ) public {
        products[_index] = Product(
            payable(msg.sender),
            _name,
            _image,
            _description,
            _date,
            _price
        );
    }

    function readProduct(uint256 _index)
        public
        view
        returns (
            address payable,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        return (
            products[_index].owner,
            products[_index].name,
            products[_index].image,
            products[_index].description,
            products[_index].date,
            products[_index].price
        );
    }

    function rentProduct(
        uint256 _index,
        string memory _date,
        uint256 _numDays
    ) public payable {
        uint256 _finalPrice = products[_index].price * _numDays;
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                products[_index].owner,
                _finalPrice
            ),
            "Transfer failed."
        );
        products[_index].date = _date;
        rented[msg.sender].push(_index);
    }

    function getProductsLength() public view returns (uint256) {
        return (productsLength);
    }

    function getCreated(address _user) public view returns (uint256[] memory) {
        return (created[_user]);
    }

    function getRented(address _user) public view returns (uint256[] memory) {
        return (rented[_user]);
    }
}
