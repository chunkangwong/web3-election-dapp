App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",

  init: () => {
    return App.initWeb3();
  },

  initWeb3: async () => {
    await ethereum.request({ method: "eth_requestAccounts" });
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = ethereum;
      web3 = new Web3(ethereum);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: () => {
    $.getJSON("Election.json", (election) => {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
  },

  castVote: async () => {
    const candidateId = $("#candidatesSelect").val();
    const electionInstance = await App.contracts.Election.deployed();
    try {
      await electionInstance.vote(candidateId, {
        from: App.account,
      });
      $("#content").hide();
      $("#loader").show();
    } catch (error) {
      console.error(error);
    }
  },

  listenForEvents: async () => {
    const electionInstance = await App.contracts.Election.deployed();
    electionInstance
      .votedEvent(
        {},
        {
          fromBlock: 0,
          toBlock: "latest",
        }
      )
      .watch((error, event) => {
        console.log("event triggered", event);
        // Reload when a new vote is recorded
        App.render();
      });
  },

  render: async () => {
    let electionInstance;
    const loader = $("#loader");
    const content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase((err, account) => {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    try {
      electionInstance = await App.contracts.Election.deployed();
      const candidatesCount = await electionInstance.candidatesCount();
      const candidatesResults = $("#candidatesResults");
      candidatesResults.empty();
      const candidatesSelect = $("#candidatesSelect");
      candidatesSelect.empty();

      for (let i = 1; i <= candidatesCount; i++) {
        const candidate = await electionInstance.candidates(i);
        const id = candidate[0];
        const name = candidate[1];
        const voteCount = candidate[2];

        // Render candidate Result
        const candidateTemplate =
          "<tr><th>" +
          id +
          "</th><td>" +
          name +
          "</td><td>" +
          voteCount +
          "</td></tr>";
        candidatesResults.append(candidateTemplate);

        // Render candidate ballot option
        const candidateOption =
          "<option value='" + id + "' >" + name + "</ option>";
        candidatesSelect.append(candidateOption);
      }

      const hasVoted = await electionInstance.voters(App.account);

      if (hasVoted) {
        $("form").hide();
      }
      loader.hide();
      content.show();
    } catch (error) {
      console.warn(error);
    }
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
