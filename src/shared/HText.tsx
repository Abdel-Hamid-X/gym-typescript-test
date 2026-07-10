import {
    Children
} from 'react'

type Props = {
    children: React.ReactNode
}

function Htext({ children }: Props) {
    return (
        <h1
            className="
                basis-3/5
                text-4xl 
                font-montserrat
                font-bold
                uppercase
                tracking-wide
                text-white">
            {children}
        </h1>
    )
}

export default Htext
