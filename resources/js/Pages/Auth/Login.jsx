import React from 'react';
import { useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        role: 'kasir',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="bg-background min-h-screen flex items-center justify-center p-md text-on-surface relative overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#d6ae5c]/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative w-full max-w-md premium-card p-8 sm:p-10">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-xl">
                    <span
                        className="material-symbols-outlined text-primary text-5xl mb-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        coffee
                    </span>
                    <h1 className="font-serif text-3xl text-primary font-bold">Kanakana</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                        Portal operasional kantin santri
                    </p>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">{status}</div>
                )}

                <form className="space-y-lg" onSubmit={submit}>
                    <div className="space-y-xs">
                        <label
                            className="block font-label-bold text-label-bold text-on-surface"
                            htmlFor="email"
                        >
                            Username / Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-on-surface-variant">
                                    person
                                </span>
                            </div>
                            <input
                                className="block w-full pl-xl pr-sm py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors h-pos-touch-target"
                                id="email"
                                name="email"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                autoComplete="username"
                                required
                                placeholder="Enter your username or email"
                                type="text"
                            />
                        </div>
                        {errors.email && <p className="mt-xs text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div className="space-y-xs">
                        <label
                            className="block font-label-bold text-label-bold text-on-surface"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                            </div>
                            <input
                                className="block w-full pl-xl pr-sm py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors h-pos-touch-target"
                                id="password"
                                name="password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                autoComplete="current-password"
                                required
                                placeholder="Enter your password"
                                type="password"
                            />
                        </div>
                        {errors.password && <p className="mt-xs text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <div className="space-y-xs">
                        <label
                            className="block font-label-bold text-label-bold text-on-surface"
                            htmlFor="role"
                        >
                            Role
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-on-surface-variant">badge</span>
                            </div>
                            <select
                                className="block w-full pl-xl pr-lg py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors appearance-none h-pos-touch-target"
                                id="role"
                                name="role"
                                value={data.role}
                                onChange={(event) => setData('role', event.target.value)}
                            >
                                <option value="kasir">Cashier</option>
                                <option value="admin">Admin</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-sm pointer-events-none text-on-surface-variant">
                                <span className="material-symbols-outlined">expand_more</span>
                            </div>
                        </div>
                    </div>

                    <button
                        className="w-full flex items-center justify-center bg-primary text-on-primary font-headline-sm text-headline-sm rounded-lg h-pos-touch-target mt-xl transition-colors active:bg-on-primary-fixed-variant disabled:opacity-50"
                        type="submit"
                        disabled={processing}
                    >
                        <span>Masuk</span>
                        <span className="material-symbols-outlined ml-sm">arrow_forward</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
