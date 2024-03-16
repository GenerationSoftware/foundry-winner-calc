export const winnersABI = [
  {
    name: "winnersArray",
    inputs: [
      {
        name: "winners",
        type: "tuple[]",
        components: [
          { name: "user", type: "address" },
          { name: "prizeIndex", type: "uint32" }
        ]
      }
    ]
  }
] as const