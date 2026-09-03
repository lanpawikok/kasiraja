import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            onFinish: () => reset(),
        });
    };

    return (
        <section className={className}>
            <div className="flex items-center gap-4">
                <button
                    onClick={confirmUserDeletion}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm shadow-red-200 transition-all"
                >
                    Hapus Akun Saya
                </button>
                <p className="text-sm text-gray-500">Akun akan dihapus permanen</p>
            </div>

            {confirmingUserDeletion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Hapus Akun Permanen?
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Tindakan ini tidak dapat dibatalkan. Semua data Anda akan hilang selamanya.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={deleteUser} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="password" value="Konfirmasi dengan password Anda" className="text-sm font-medium text-gray-700" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    className="mt-1 block w-full rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500 shadow-sm"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Masukkan password Anda"
                                    autoFocus
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmingUserDeletion(false);
                                        reset();
                                    }}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium shadow-sm shadow-red-200 transition-all disabled:opacity-50"
                                >
                                    Hapus Permanen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}