const Election = artifacts.require("./Election.sol");

contract("Election", (accounts) => {
  let electionInstance;

  before(async () => {
    electionInstance = await Election.deployed();
  });

  it("initializes with two candidates", async () => {
    const count = await electionInstance.candidatesCount();
    assert.equal(count, 2);
  });

  it("it initializes the candidates with the correct values", async () => {
    const candidate1 = await electionInstance.candidates(1);
    assert.equal(candidate1[0], 1, "contains the correct id");
    assert.equal(candidate1[1], "Candidate 1", "contains the correct name");
    assert.equal(candidate1[2], 0, "contains the correct votes count");
    const candidate2 = await electionInstance.candidates(2);
    assert.equal(candidate2[0], 2, "contains the correct id");
    assert.equal(candidate2[1], "Candidate 2", "contains the correct name");
    assert.equal(candidate2[2], 0, "contains the correct votes count");
  });

  it("allows a voter to cast a vote", async () => {
    const candidateId = 1;
    await electionInstance.vote(candidateId, {
      from: accounts[0],
    });
    const voted = await electionInstance.voters(accounts[0]);
    assert(voted, "the voter was marked as voted");
    const candidate = await electionInstance.candidates(candidateId);
    const voteCount = candidate[2];
    assert.equal(voteCount, 1, "increments the candidate's vote count");
  });

  it("throws an exception for invalid candidates", async () => {
    try {
      await electionInstance.vote(99, { from: accounts[1] });
    } catch (error) {
      assert(
        error.message.indexOf("revert") >= 0,
        "error message must contain revert"
      );
      const candidate1 = await electionInstance.candidates(1);
      const voteCount1 = candidate1[2];
      assert.equal(voteCount1, 1, "candidate 1 did not receive any votes");
      const candidate2 = await electionInstance.candidates(2);
      const voteCount2 = candidate2[2];
      assert.equal(voteCount2, 0, "candidate 2 did not receive any votes");
    }
  });
});
