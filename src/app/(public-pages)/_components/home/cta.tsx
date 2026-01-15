import { ArrowRight } from "lucide-react";
import Link from "next/link";
const Catedral = () => {
    return (
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 py-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Ready to Start Trading?
                </h2>

                <p className="text-xl text-white/90 mb-10">
                    Join thousands of users who trust GlobaCoin for their cryptocurrency needs.
                </p>

                {/* Buttons */}
                <div className="flex justify-center flex-wrap gap-4">
                    {/* Primary Button */}
                    <Link
                        href="/sign-in"
                        className="flex items-center justify-center bg-white text-blue-600 font-semibold py-3 px-8 rounded-md transition-all duration-300 hover:bg-gray-100"
                    >
                        Get Started Free
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>

                    {/* Secondary Button */}
                    <button className="flex items-center justify-center border border-white text-white font-semibold py-3 px-8 rounded-md transition-all duration-300 hover:bg-white hover:text-blue-600 ">
                        View Prices
                    </button>
                </div>

                <p className="mt-10 text-sm text-white/80">
                    No credit card required • Free account • Start trading in minutes
                </p>
            </div>
        </section>
    );
};

export default Catedral;
