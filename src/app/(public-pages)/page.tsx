import Hero from "./_components/home/hero";
import HowItWorks from "./_components/home/howit-works";
import PlatformIntro from "./_components/home/platform-intro";
import WalletSystem from "./_components/home/wallet-system";

const HomePage = () => {
    return (
        <>
            <Hero />
            <PlatformIntro />
            <HowItWorks />
            <WalletSystem />
        </>
    )
}
export default HomePage;