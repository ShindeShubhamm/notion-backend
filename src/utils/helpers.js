const dataToBase64 = (data) => {
    return Buffer.from(data).toString('base64');
};

module.exports = { dataToBase64 };
