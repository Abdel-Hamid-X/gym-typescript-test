import Logo from "@/assets/Logo.png";

const Footer = () => {
    return (
        <footer className="border-t border-gray-100 bg-primary-100 py-16">
            <div className="justify-content mx-auto w-5/6 gap-16 md:flex">
                <div className="mt-16 basis-1/2 md:mt-0">
                    <img alt="logo" src={Logo} />
                    <p className="my-5 text-gray-500">
                        Strength-focused coaching, heavy training rooms, and high-performance
                        classes for members who want to work.
                    </p>
                    <p>EVOGYM All Rights Reserved.</p>
                </div>
                <div className="mt-16 basis-1/4 md:mt-0">
                    <h4 className="font-bold uppercase tracking-wide">Links</h4>
                    <p className="my-5 text-gray-500">Strength Classes</p>
                    <p className="my-5 text-gray-500">Performance Coaching</p>
                    <p className="text-gray-500">Membership</p>
                </div>
                <div className="mt-16 basis-1/4 md:mt-0">
                    <h4 className="font-bold uppercase tracking-wide">Contact Us</h4>
                    <p className="my-5 text-gray-500">Ready to train harder? Talk to our team.</p>
                    <p>(213)552-409-383</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
