import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, UserPlus, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login, register, isAuthenticated, isLoading, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (isForgotPassword) {
      if (!email) {
        setError('メールアドレスを入力してください');
        return;
      }

      const result = await resetPassword(email);
      if (result.success) {
        setSuccessMessage(result.message);
        setEmail('');
      } else {
        setError(result.message);
      }
      return;
    }

    if (isLogin) {
      if (!email) {
        setError('メールアドレスを入力してください');
        return;
      }
      
      try {
        const success = await login(email, password);
        if (success) {
          navigate('/');
        } else {
          setError('メールアドレスまたはパスワードが正しくありません');
        }
      } catch (err) {
        setError('ログイン中にエラーが発生しました');
      }
    } else {
      if (!email || !password || !confirmPassword || !name || !department) {
        setError('すべての項目を入力してください');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('パスワードが一致しません');
        return;
      }

      try {
        const success = await register({
          email,
          password,
          name,
          department
        });

        if (success) {
          navigate('/');
        } else {
          setError('このメールアドレスは既に使用されています');
        }
      } catch (err) {
        setError('登録中にエラーが発生しました');
      }
    }
  };

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center">
            <img
              src="/ohwan-logo.svg"
              alt="OHWAN"
              className="h-20 w-auto"
            />
          </div>
          <p className="mt-2 text-gray-600">
            {isForgotPassword ? 'パスワードリセット' : isLogin ? 'サインイン' : 'アカウントを作成'}
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 animate-fade-in">
          <form className="mb-0 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border"
                  placeholder="メールアドレスを入力"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  パスワード
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border pr-10"
                    placeholder="パスワードを入力"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    パスワード（確認）
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border pr-10"
                      placeholder="パスワードを再入力"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    名前
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border"
                      placeholder="名前を入力"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                    部署
                  </label>
                  <div className="mt-1">
                    <select
                      id="department"
                      name="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border"
                      required
                    >
                      <option value="">部署を選択</option>
                      <option value="役員">役員</option>
                      <option value="営業">営業</option>
                      <option value="製作">製作</option>
                      <option value="オペレーター">オペレーター</option>
                      <option value="総務・経理">総務・経理</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>
            )}

            {successMessage && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded">{successMessage}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                      <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'サインイン中...' : '登録中...'}
                  </span>
                ) : (
                  <span className="flex items-center">
                    {isForgotPassword ? (
                      'リセットメールを送信'
                    ) : isLogin ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        サインイン
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        アカウントを作成
                      </>
                    )}
                  </span>
                )}
              </button>
            </div>
          </form>

          {isLogin && !isForgotPassword && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                パスワードをお忘れの方
              </button>
            </div>
          )}

          {isForgotPassword && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                ログイン画面に戻る
              </button>
            </div>
          )}

          {!isForgotPassword && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {isLogin ? 'アカウントをお持ちでない方' : 'すでにアカウントをお持ちの方'}
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  {isLogin ? 'アカウントを作成' : 'サインイン'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;