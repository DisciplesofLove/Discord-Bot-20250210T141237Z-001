// Reputation system validators
const validatePoints = (points) => {
    return Number.isInteger(points) && points > 0 && points <= 1000;
};

module.exports = {
    validatePoints
};