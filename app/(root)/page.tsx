import React from 'react'
import { Button } from "@/components/ui/button"
import Link from "next/link";
import Image from "next/image"
import InterviewCard from "@/components/InterviewCard";
import {getCurrentUser} from "@/lib/actions/auth.action";
import {getInterviewsByUserId, getLatestInterviews} from "@/lib/actions/general.action";

const Page = async () => {
    const user = await getCurrentUser();
    const [userInterviews, latestInterviews] = await Promise.all([
        (await getInterviewsByUserId(user?.id!)) || [],
        (await getLatestInterviews({ userId: user?.id! })) || []
    ]);

    const hasPastInterviews = userInterviews?.length > 0;
    const hasUpcomingInterviews = latestInterviews?.length > 0;

    return (
        <>
            <section className="card-cta">
                        {/* Left Side: Main Content (Tightened) */}
                <div className="flex flex-col md:flex-row items-center gap-16 px-8 py-12 max-w-7xl mx-auto">

                    {/* Left Side: Main Content (2/3 Width) */}
                    <div className="md:basis-2/3 flex flex-col gap-10">
                        <div className="flex flex-col gap-4">
                            <h2 className="text-4xl font-bold leading-tight text-white">
                                Get Interview-Ready with <span className="font-bold not-italic text-purple-400">AI-Powered </span>
                                Practice & Feedback
                            </h2>
                            <p className="text-xl text-gray-400">
                                Practice on real interview questions and get instant feedback.
                            </p>
                        </div>

                        <Button asChild className="w-fit px-8 py-6 text-md rounded-xl bg-purple-400 transition-all shadow-lg shadow-purple-500/20 font-semibold">
                            <Link href="/interview">Start an Interview</Link>
                        </Button>
                    </div>

                    {/* Right Side: Slogan (1/3 Width) */}
                    <div className="md:basis-1/3 text-right">
                        <h2 className="text-4xl font-bold leading-snug text-[#F0CC38] opacity-80">
                            Customized topics for <span className="font-bold not-italic text-white">any </span>
                            professional role.
                        </h2>
                    </div>

                </div>
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Interviews</h2>

                <div className="interviews-section">
                    {hasPastInterviews ? (
                        userInterviews?.map((interview) => (
                            <InterviewCard {...interview} key={interview.id}/>
                        ))) : (

                                <p>You haven&apos;t taken any interviews yet</p>
                    )}
                </div>
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Take an Interview</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 w-full max-w-7x">
                        {hasUpcomingInterviews ? (
                            latestInterviews?.map((interview) => (
                                <InterviewCard {...interview} key={interview.id}/>
                            ))) : (

                            <p>There are no new interviews available</p>
                        )}
                    </div>
            </section>
        </>
    )
}
export default Page