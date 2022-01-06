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

library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     *
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}


contract Rent {
    using SafeMath for uint;
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

//    ensure only owner can call this function
    modifier onlyOwner(uint _index){
        require(products[_index].owner == msg.sender, "only callable by owner");
        _;
    }

    //    ensure only owner can call this function
    modifier productExists(uint _index){
        require(products[_index].owner != address(0), "product doesn't exist");
        _;
    }

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
        productsLength.add(1);
    }

    function editProduct(
        uint256 _index,
        string memory _name,
        string memory _image,
        string memory _description,
        string memory _date,
        uint256 _price
    ) public onlyOwner(_index) productExists(_index) {
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
        productExists(_index)
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
    ) public payable productExists(_index) {
        uint256 _finalPrice = products[_index].price.mul(_numDays);
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
