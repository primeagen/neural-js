var _ = require('lodash');
var ExperimentalDatasets = require('ExperimentalDatasets');

/**
 * A required addition to the math library for the hyperbolicTangent activation function
 * @param {Number} x
 * @returns {Number}
 */
Math.tanh = function(x) {
    var eX = Math.pow(Math.E, x);
    var emX = Math.pow(Math.E, -x);

    return (eX - emX) / (eX + emX);
};

/**
 * The hypertangent
 * @param {Number} x
 * @returns {Number}
 */
var hyperTangent = function(x) {
    return Math.tanh(x);
};

/**
 * The logisticFunction function is 1 / (1 + e ^ (-x))
 * @param x
 */
function logisticFunction(x) {
    return 1 / (1 + Math.pow(Math.E, -x));
}

/**
 * @param {NeuralNetwork} network
 * @param t
 */
function five2Training(network, t) {
    var datasets = ExperimentalDatasets.five2(t);

    trainData(network, datasets[0]);
    var d1 = testData(network, datasets[1]);

    trainData(network, datasets[1]);
    var d2 = testData(network, datasets[0]);

    var d1ErrRatio = d1[1] / d1[0];
    var d2ErrRatio = d2[1] / d2[0];
    return [d1ErrRatio, d2ErrRatio, (d1ErrRatio + d2ErrRatio) / 2];
}

/**
 * Will perform a test and calculate the average error from perspective of to - ao
 * @param {NeuralNetwork} network
 * @param t
 */
function testData(network, t) {
    var tOut = 0;
    var tErr = 0;

    for (var i = 0; i < t.length; i += 2) {
        var input = t[i];
        var expectedOutput = t[i + 1];

        var output = network.test(input);
        for (var o = 0; o < output.length; o++) {
            tOut += output[o];
            tErr += output[o] - expectedOutput[o];
        }
    }

    return [tOut, tErr];
}

/**
 * The derivative of the logistic function
 * @param {Number} x
 * @returns {Number}
 */
function dLogisticFunction(x) {
    return x * (1 - x);
}


/**
 * The set of types for the activation functions
 * @name NetworkFunctionTypes
 */
var Types = {
    HyperbolicTangent: 'hbt',
    Sigmoid: 'sig'
};

/**
 * @param {NeuralNetwork} network
 * @param t
 */
function trainData(network, t) {
    for (var i = 0; i < t.length; i += 2) {
        var input = t[i];
        var expectedOutput = t[i + 1];

        network.train(input, expectedOutput);
    }
}

/**
 *
 * @name NetworkTrainer
 * @param {NeuralNetwork} network
 * @param t
 * @param n
 */
function train(network, t, n) {
    for (var trains = 0; trains < n; trains++) {
        trainData(network, t);
    }
}

/**
 * @name NetworkConverger
 * @param {NeuralNetwork} network
 * @param t
 * @param exit
 */
function converge(network, t, exit) {
    exit = exit || 1000000;
    var i = 0;
    while (i < exit && !network.isConverged()) {
        trainData(network, t);
        i++;
    }
}

function trainOnce(network, t) {
    var i = Math.floor(Math.random() * t.length);

    if (i % 2 !== 0) {
        i--;
    }

    network.train(t[i], t[i + 1]);
}

/**
 * @name NetworkValidator
 * @param {NeuralNetwork} network
 * @param t
 */
function validate(network, t) {
    for (var i = 0; i < t.length; i += 2) {
        var input = t[i];
        var expectedOutput = t[i + 1];

        var actualOutput = network.test(input, expectedOutput);
        if (_.difference(expectedOutput, actualOutput).length !== 0) {
            return false;
        }
    }
    return true;
}

module.exports = {
    /**
     * The logisticFunction
     */
    logisticFunction: logisticFunction,

    /**
     * The derivative of the logistic function
     */
    dLogisticFunction: dLogisticFunction,

    /**
     * The training program for a neural network
     * @type NetworkTrainer
     */
    train: train,

    /**
     * Converges the network
     * @type NetworkConverger
     */
    convergeNetwork: converge,

    /**
     * @type NetworkValidator
     */
    validate: validate,

    /**
     * Train once
     */
    trainOnce: trainOnce,

    /**
     * Trains with the 5 / 2 training.  This will only run the algorithm 1 time
     */
    five2Training: five2Training,

    /**
     * @type NetworkFunctionTypes
     */
    Types: Types
};