import AnchorLink from "react-anchor-link-smooth-scroll"
import { SelectedPage } from "./types";

type Props = {
  children: React.ReactNode;
  setselectedPage: (value: SelectedPage) => void;
}

const ActionButton = ( {children,setselectedPage}: Props) => {
  return (
    <AnchorLink
      className="rounded-md 
        bg-secondary-500 
        px-10 
        py-2 
        text-white 
        hover:bg-primary-500 
        hover:text-white 
        transition 
        duration-300"
        onClick={
            () => setselectedPage(SelectedPage.ContactUs)
        }
        href={
            `#${SelectedPage.ContactUs}`
        }
    >
        {children}
    </AnchorLink>
  )
}
export default ActionButton