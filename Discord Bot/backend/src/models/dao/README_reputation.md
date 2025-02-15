# Love and Vice Reputation System

The reputation system tracks user interactions and contributions through a dual scoring mechanism:

## Score Types

- **Love Score**: Tracks positive contributions
- **Vice Score**: Tracks negative contributions

## Actions and Points

- Good Training Data: +10 love points
- Bad Training Data: +5 vice points
- Good Dataset Contribution: +8 love points
- Bad Dataset Contribution: +4 vice points
- General Participation: +2 love points

## Usage

To update a member's reputation:

```javascript
await trainingService.updateMemberReputation(
    discordId,
    'GOOD_TRAINING',
    'Provided high-quality training data'
);
```

To get a member's reputation:

```javascript
const reputation = await trainingService.getMemberReputation(discordId);
console.log(reputation.loveScore); // Positive reputation
console.log(reputation.viceScore); // Negative reputation
console.log(reputation.total); // Net reputation (love - vice)
console.log(reputation.history); // Full history of reputation changes
```

This scoring system helps train the AI by providing feedback on user contributions and their quality.