import React from 'react';

export default function Login() {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-md text-on-surface">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-lg p-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-xl">
          <span 
            className="material-symbols-outlined text-primary text-5xl mb-sm" 
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            coffee
          </span>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">
            BrewMaster Pro
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Login to access operations.
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-lg">
          {/* Username/Email Field */}
          <div className="space-y-xs">
            <label className="block font-label-bold text-label-bold text-on-surface" htmlFor="username">
              Username / Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              </div>
              <input 
                className="block w-full pl-xl pr-sm py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors h-pos-touch-target" 
                id="username" 
                name="username" 
                placeholder="Enter your username or email" 
                type="text"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-xs">
            <div className="flex justify-between items-center">
              <label className="block font-label-bold text-label-bold text-on-surface" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant">lock</span>
              </div>
              <input 
                className="block w-full pl-xl pr-sm py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors h-pos-touch-target" 
                id="password" 
                name="password" 
                placeholder="Enter your password" 
                type="password"
              />
            </div>
          </div>

          {/* Role Selector */}
          <div className="space-y-xs">
            <label className="block font-label-bold text-label-bold text-on-surface" htmlFor="role">
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
                defaultValue="cashier"
              >
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-sm pointer-events-none text-on-surface-variant">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            className="w-full flex items-center justify-center bg-primary text-on-primary font-headline-sm text-headline-sm rounded-lg h-pos-touch-target mt-xl transition-colors active:bg-on-primary-fixed-variant" 
            type="submit"
          >
            <span>Masuk</span>
            <span className="material-symbols-outlined ml-sm">arrow_forward</span>
          </button>
        </form>
      </div>
    </div>
  );
}