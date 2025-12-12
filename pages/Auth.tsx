import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore, useToastStore } from '../store';
import { Api } from '../services/api';
import { Button, Input, Card } from '../components/Common';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthForm = z.infer<typeof authSchema>;

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthForm) => {
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        const { user, token } = await Api.login(data.email);
        login(user, token);
        addToast(`Welcome back, ${user.name}!`, 'success');
        navigate(user.role === 'admin' ? '/admin' : '/');
      } else {
        // Register simulation (For now, real backend only has hardcoded users in seed, 
        // but typically this would POST /auth/register)
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Auto login for demo
        const { user, token } = await Api.login('user@nexus.com'); 
        login(user, token);
        addToast('Account created successfully!', 'success');
        navigate('/');
      }
    } catch (err) {
      setError('Invalid credentials. Try: admin@nexus.com or user@nexus.com');
      addToast('Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
             Or <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-primary-600 hover:text-primary-500">
               {isLogin ? 'start your 14-day free trial' : 'sign in to existing account'}
             </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input 
                label="Email address" 
                type="email" 
                autoComplete="email"
                error={errors.email?.message} 
                {...register('email')} 
            />
            <Input 
                label="Password" 
                type="password" 
                autoComplete="current-password"
                error={errors.password?.message} 
                {...register('password')} 
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
            </Button>
          </div>

          {isLogin && (
              <div className="mt-4 text-center text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  <p>Demo Admin: admin@nexus.com / password</p>
                  <p>Demo User: user@nexus.com / password</p>
              </div>
          )}
        </form>
      </Card>
    </div>
  );
};
