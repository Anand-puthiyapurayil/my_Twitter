const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("Twitter Contract", function() {
  let Twitter;
  let twitter;
  let owner;

  const OTHER_USERS_TWEETS = 5;
  const OWNER_TWEETS = 3;

  let totalTweets;
  let totalMyTweets;

  beforeEach(async function() {
    Twitter = await ethers.getContractFactory("TwitterContract");
    [owner, addr1, addr2] = await ethers.getSigners();
    twitter = await Twitter.deploy();

    totalTweets = [];
    totalMyTweets = [];

    for(let i=0; i<OTHER_USERS_TWEETS; i++) {
      let tweet = {
        'tweetText': 'Ramdon text with id:- ' + i,
        'username': addr1,
        'isDeleted': false
      };

      await twitter.connect(addr1).addTweet(tweet.tweetText, tweet.isDeleted);
      totalTweets.push(tweet);
    }

    for(let i=0; i<OWNER_TWEETS; i++) {
      let tweet = {
        'username': owner,
        'tweetText': 'Ramdon text with id:- ' + (NUM_TOTAL_NOT_MY_TWEETS+i),
        'isDeleted': false
      };

      await twitter.addTweet(tweet.tweetText, tweet.isDeleted);
      totalTweets.push(tweet);
      totalMyTweets.push(tweet);
    }
  });

  describe("Add Tweet", function() {
    it("should emit AddTweet event", async function() {
      let tweet = {
        'tweetText': 'New Tweet',
        'isDeleted': false
      };

      await expect(await twitter.addTweet(tweet.tweetText, tweet.isDeleted)
    ).to.emit(twitter, 'AddTweet').withArgs(owner.address, OTHER_USERS_TWEETS + OWNER_TWEETS);
    })
  });

  describe("Get All Tweets", function() {
    it("should return the correct number of total tweets", async function() {
      const tweetsFromChain = await twitter.getAllTweets();
      expect(tweetsFromChain.length).to.equal(OTHER_USERS_TWEETS+OWNER_TWEETS);
    })

    it("should return the correct number of all my tweets", async function() {
      const myTweetsFromChain = await twitter.getMyTweets();
      expect(myTweetsFromChain.length).to.equal(OWNER_TWEETS);
    })
  })

  describe("Delete Tweet", function() {
    it("should emit delete tweet event", async function() {
      const TWEET_ID = 0;
      const TWEET_DELETED = true;

      await expect(
        twitter.connect(addr1).deleteTweet(TWEET_ID, TWEET_DELETED)
      ).to.emit(
        twitter, 'DeleteTweet'
      ).withArgs(
        TWEET_ID, TWEET_DELETED
      );
    })
  })

  describe('Update Tweet', () => {
    it('should emit UpdateTweet event', async () => {
      const TWEET_ID = 26; 
      const TWEET_NEW_TEXT = 'new tweet text';
      const TWEET_DELETED = false;

      await expect(
        await twitter
          .connect(addr1)
          .updateTweet(TWEET_ID, TWEET_NEW_TEXT, TWEET_DELETED)
      )
        .to.emit(twitter, 'UpdateTweet')
        .withArgs(owner.address, TWEET_ID, TWEET_DELETED);
    });
  });
});