//passport関連をインストールしてから作る
const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  //ユーザー名・パスワード・salt(ソルト)はpassportLocalMongooseによって自動生成される
  email: {
    type: String,
    required: true,
    unique: true
  }
});

userSchema.plugin(passportLocalMongoose, {
  errorMessages: {
    UserExistsError: 'そのユーザー名はすでに使われています',
    MissingPasswordError:'パスワードが指定されていません',
    AttemptTooSoonError: 'アカウントは現在ロックされています。しばらく経ってからもう一度お試しください',
    TooManyAttemptsError: 'ログイン試行の失敗回数が多すぎるためアカウントがロックされました',
    NoSaltValueStoredError: '認証できません。ソルト値が保存されていません',
    IncorrectPasswordError: 'パスワードまたはユーザー名が間違っています',
    IncorrectUsernameError: 'パスワードまたはユーザー名が間違っています',
    MissingUsernameError: 'ユーザー名が指定されていません'
  }
});

module.exports = mongoose.model('User', userSchema);