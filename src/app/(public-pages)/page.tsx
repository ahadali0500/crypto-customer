import Hero from "./_components/home/hero";
import HowItWorks from "./_components/home/howit-works";
import PlatformIntro from "./_components/home/platform-intro";
import WalletSystem from "./_components/home/wallet-system";
import Catedral from "./_components/home/cta";
const HomePage = () => {
    return (
        <>
            <Hero />
            <PlatformIntro />
            <HowItWorks />
            <WalletSystem />
            <Catedral />
        </>
    )
}
export default HomePage;