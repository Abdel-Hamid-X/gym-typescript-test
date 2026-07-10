import React from 'react'

type Props = {
    name: string
    description?: string
    image: string
}

const Class = ({ name, description, image }: Props) => {
    const overlayStyles = `
        p-5 
        absolute 
        inset-0
        flex 
        flex-col
        items-center
        justify-center
        whitespace-normal
        bg-gray-20/70
        border-2
        border-primary-500
        text-center
        text-white
        opacity-0
        transition
        duration-500
        group-hover:opacity-100`;
    return (
        <div
            className='
        group
        relative
        z-0
        aspect-[4/3]
        overflow-hidden
        border
        border-gray-100
        bg-gray-20'>
            <img
                className='
                h-full
                w-full
                object-cover
                transition
                duration-500
                group-hover:scale-95
                group-hover:blur-sm'
                src={image}
                alt={name} />
            <div
                className={overlayStyles}>
                <p className='font-montserrat text-3xl uppercase tracking-wide'>{name}</p>
                <p className='mt-5 text-gray-500'>{description}</p>
            </div>
        </div>
    )
}

export default Class
