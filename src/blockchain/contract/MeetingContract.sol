pragma solidity >= 0.5.0 < 0.6.0;
contract MeetingContract {
    
    enum ROLES {UNREG, OWNER}
    
    struct PassportInfo {
        address userAddress;
        string salt;
        string hash; // hash("salt" + "number")
    }
    
    struct Meeting {
        string description;
        uint256 amountOfMembers;
        mapping (uint256 => PassportInfo) passports;
        mapping (address => bool) isMember;
    }
    
    event onAddPassportInfo(uint256 indexed numberOfMeeting, address userAddress, string salt, string hash);
    event onNewMeeting(uint256 numberOfMeeting, string description);
    
    mapping  (address => ROLES) public user_roles;
    mapping (uint256 => Meeting) public meetings;
    uint256 public amountOfMeetings;
    
    
    modifier onlyOwner(){
        require(user_roles[msg.sender] == ROLES.OWNER);
        _;
    }
    
    constructor () public {
        user_roles[msg.sender] = ROLES.OWNER;
    }
    
    function newMeeting (string calldata _description) external onlyOwner {
        meetings[amountOfMeetings] = Meeting({
            description : _description,
            amountOfMembers : 0
        });
        amountOfMeetings++;
        emit onNewMeeting(amountOfMeetings - 1, _description);
    }
    
    function participate(uint256 numberOfMeeting, string calldata _salt, string calldata _hash) external {
        require(meetings[numberOfMeeting].isMember[msg.sender] == false);
        meetings[numberOfMeeting]
        .passports[meetings[numberOfMeeting].amountOfMembers] = PassportInfo({
            userAddress : msg.sender,
            salt : _salt,
            hash : _hash
        });
        meetings[numberOfMeeting].isMember[msg.sender] = true;
        meetings[numberOfMeeting].amountOfMembers++;
        emit onAddPassportInfo(numberOfMeeting, msg.sender, _salt, _hash);
    }
    
    function loadMeeting(uint256 numberOfMeeting) external view returns (string memory){
        return meetings[numberOfMeeting].description;
    }
    
    function getAmountOfMeetings() external view returns (uint256) {
        return amountOfMeetings;
    }
    
    function getRole(address addr) external view returns (ROLES) {
        return user_roles[addr];
    }
    
}