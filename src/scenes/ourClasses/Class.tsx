import React from 'react'
import type { ClassSchedule } from '@/shared/mockData'
import { useLanguage } from '@/shared/LanguageContext'

const DAY_KEYS = {
    monday: "weekday_monday", tuesday: "weekday_tuesday", wednesday: "weekday_wednesday",
    thursday: "weekday_thursday", friday: "weekday_friday", saturday: "weekday_saturday", sunday: "weekday_sunday",
} as const

type Props = {
    name: string
    description?: string
    image: string
    coachName?: string
    schedule: ClassSchedule[]
}

const Class = ({ name, description, image, coachName, schedule }: Props) => {
    const { t } = useLanguage()
    const overlayStyles = `
        p-5 
        absolute 
        inset-0
        flex 
        flex-col
        items-center
        justify-start
        overflow-y-auto
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
                <p className='font-montserrat text-2xl uppercase tracking-wide'>{name}</p>
                <p className='mt-3 text-sm text-gray-500'>{description}</p>
                {coachName && <p className='mt-3 text-sm font-bold text-primary-300'>{t("classes_coach")}: {coachName}</p>}
                {schedule.length > 0 && <div className='mt-3 w-full border-t border-gray-100 pt-3'>
                    <p className='text-xs font-bold text-gray-400'>{t("classes_schedule")}</p>
                    <div className='mt-2 grid gap-1 text-xs'>
                        {schedule.map((slot) => <p key={slot.id}><span>{t(DAY_KEYS[slot.weekday])}</span> · <span className='numbers'>{slot.startTime}</span> · <span className='numbers'>{slot.durationMinutes}</span> {t("schedule_minutes")}</p>)}
                    </div>
                </div>}
            </div>
        </div>
    )
}

export default Class
