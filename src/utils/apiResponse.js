const success = (res, data = {}, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const failure = (res, message = 'Error', statusCode = 400, details) => {
  return res.status(statusCode).json({
    success: false,
    message,
    details,
  });
};

module.exports = {
  success,
  failure,
};

