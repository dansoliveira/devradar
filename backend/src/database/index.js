import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URL_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
