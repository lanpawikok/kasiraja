import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" className="text-sm font-medium text-gray-700" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-sm font-medium text-gray-700" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-sm text-yellow-800">
                            Email Anda belum diverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Kirim ulang verifikasi email
                            </Link>
                        </p>
                    </div>
                )}

                {status === 'profile-updated' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                        <p className="text-sm text-green-700 font-medium">✅ Profil berhasil diperbarui!</p>
                    </div>
                )}

                <div className="flex items-center gap-4 pt-4">
                    <PrimaryButton 
                        className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-xl font-medium shadow-sm shadow-indigo-200 transition-all"
                        disabled={processing}
                    >
                        Simpan Perubahan
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600">Tersimpan.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}