import React, { useState } from 'react';
import { Icon } from './icons';

interface AuthProps {
    onLogin: () => void;
}

type AuthScreenType = 'login' | 'register' | 'recovery';

const SocialButton: React.FC<{
    provider: 'google' | 'outlook',
    onClick: () => void,
    isLoading?: boolean
}> = ({ provider, onClick, isLoading }) => {
    const isGoogle = provider === 'google';

    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all transform active:scale-95 ${isLoading ? 'opacity-70 cursor-wait' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                } border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-bold`}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {isGoogle ? (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#0072C6" d="M1 5.4h9.2v14.2H1z" />
                            <path fill="#1E457F" d="M10.2 5.4H23v14.2H10.2z" />
                            <path fill="#ffffff" d="M12.9 8h2.3v3.7h-2.3z" />
                        </svg>
                    )}
                    <span>Entrar com {isGoogle ? 'Google' : 'Outlook'}</span>
                </>
            )}
        </button>
    );
};

export const AuthScreen: React.FC<AuthProps> = ({ onLogin }) => {
    const [screen, setScreen] = useState<AuthScreenType>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [recoverySent, setRecoverySent] = useState(false);

    const simulateLogin = (delay = 1500) => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onLogin();
        }, delay);
    };

    const handleSocialLogin = () => {
        simulateLogin(2000);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            simulateLogin();
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // Here we would create the account
        simulateLogin(2000);
    };

    const handleRecovery = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setRecoverySent(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 z-10 transition-all">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3">
                        <Icon name="baby_face" className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Meu Bebê</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Diário e Monitoramento</p>
                </div>

                {/* Login Screen */}
                {screen === 'login' && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-xl font-bold text-center text-gray-700 dark:text-gray-200">Bem-vindo de volta!</h2>

                        <div className="space-y-3">
                            <SocialButton provider="google" onClick={handleSocialLogin} isLoading={isLoading} />
                            <SocialButton provider="outlook" onClick={handleSocialLogin} isLoading={isLoading} />
                        </div>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">Ou continue com email</span>
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 ring-blue-500 transition-all border border-gray-100 dark:border-gray-700"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Senha</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 ring-blue-500 transition-all border border-gray-100 dark:border-gray-700"
                                    required
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setScreen('recovery')}
                                        className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
                                    >
                                        Esqueci minha senha
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>

                        <div className="text-center">
                            <span className="text-gray-500 text-sm">Não tem uma conta? </span>
                            <button
                                onClick={() => setScreen('register')}
                                className="text-blue-500 font-bold hover:underline"
                            >
                                Cadastre-se
                            </button>
                        </div>
                    </div>
                )}

                {/* Register Screen */}
                {screen === 'register' && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-xl font-bold text-center text-gray-700 dark:text-gray-200">Crie sua conta</h2>

                        <div className="space-y-3">
                            <SocialButton provider="google" onClick={handleSocialLogin} isLoading={isLoading} />
                            <SocialButton provider="outlook" onClick={handleSocialLogin} isLoading={isLoading} />
                        </div>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">Ou cadastre com email</span>
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    placeholder="Como você quer ser chamado?"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 ring-blue-500 transition-all border border-gray-100 dark:border-gray-700"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 ring-blue-500 transition-all border border-gray-100 dark:border-gray-700"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Senha</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 ring-blue-500 transition-all border border-gray-100 dark:border-gray-700"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all transform disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Criando conta...' : 'Criar Conta'}
                            </button>
                        </form>

                        <div className="text-center">
                            <span className="text-gray-500 text-sm">Já tem uma conta? </span>
                            <button
                                onClick={() => setScreen('login')}
                                className="text-blue-500 font-bold hover:underline"
                            >
                                Fazer Login
                            </button>
                        </div>
                    </div>
                )}

                {/* Recovery Screen */}
                {screen === 'recovery' && (
                    <div className="space-y-6 animate-fade-in">
                        <button
                            onClick={() => { setScreen('login'); setRecoverySent(false); }}
                            className="flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Icon name="chevron_left" className="w-5 h-5 mr-1" />
                            Voltar
                        </button>

                        <h2 className="text-xl font-bold text-center text-gray-700 dark:text-gray-200">Recuperar Senha</h2>

                        {!recoverySent ? (
                            <form onSubmit={handleRecovery} className="space-y-6">
                                <p className="text-center text-sm text-gray-500">
                                    Digite seu email abaixo e enviaremos um link para você redefinir sua senha.
                                </p>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 ring-blue-500 transition-all border border-gray-100 dark:border-gray-700"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Enviando...' : 'Enviar Link'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center space-y-6 py-4">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
                                    <Icon name="check_circle" className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Email Enviado!</h3>
                                <p className="text-sm text-gray-500">
                                    Verifique sua caixa de entrada (e spam) para encontrar as instruções de recuperação.
                                </p>
                                <button
                                    onClick={() => setScreen('login')}
                                    className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Voltar para Login
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 text-center">
                <p className="text-[10px] text-gray-400 opacity-60">© 2024 Meu Bebê App. Versão Alpha.</p>
            </div>
        </div>
    );
};
