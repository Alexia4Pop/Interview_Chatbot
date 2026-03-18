"use client"

import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {Form, FormField} from "@/components/ui/form"
import Link from "next/link";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import CustomFormField from "@/components/CustomFormField";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "@/firebase/client";
import {signIn, signUp} from "@/lib/actions/auth.action";

interface AuthFormProps {
    type: 'sign-in' | 'sign-up';
}

const formSchema = z.object({
    username: z.string().min(2).max(50),
})

const authFormSchema = (type: FormType) => {
    return z.object({
        email: z.string().email("Valid email address"),
        password: z.string().min(3),
        name: type==='sign-up' ? z.string().min(3) : z.string().optional(),
    })
}

const AuthForm = ({ type }: AuthFormProps) => {
    const router = useRouter();
    const formSchema = authFormSchema(type);
    //1. Define form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email:"",
            password:"",
            name: "",
        }
    })

    //2. Define submit handler
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try{
            if(type === 'sign-up') {
                const {name, email, password} = values;

                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                const result = await signUp({
                    uid: userCredential.user.uid,
                    name: name!,
                    email,
                    password,
                });

                if(!result.success){
                    toast.error(result.message);
                    return;
                }

                toast.success("Account created successfully. Please sign in.");
                router.push('/sign-in');
            } else {
                const {email, password} = values;

                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                const idToken = await userCredential.user.getIdToken();

                if(!idToken){
                    toast.error('Sign in failed')
                    return;
                }

                await signIn({
                    email,
                    idToken
                })

                toast.success("Sign in successfully")
                console.log('SIGN-IN', values);
                router.push("/");
            }
        } catch (error) {
            console.log(error);
            toast.error(`There was an error: ${error}`);
        }
    }

    const isSignIn = type === 'sign-in';

    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    {/*<Image
                        src="/logo.svg"
                        alt="logo"
                        width={32}
                        height={38}
                    />*/}
                    <h2 className="text-primary-100">PrepWise</h2>
                </div>

                <h3>Practice job interview</h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
                        {!isSignIn && (
                            <CustomFormField control={form.control}
                                       name="name"
                                       label="Name"
                                       placeholder="Your Name"
                            />
                        )}
                            <CustomFormField control={form.control}
                                        name="email"
                                        label="Email"
                                        placeholder="Your email address"
                                        type="email"
                            />
                            <CustomFormField control={form.control}
                                       name="password"
                                       label="Password"
                                       placeholder="Enter your password"
                                       type="password"
                            />
                        <Button className="btn" type="submit">{isSignIn ? 'Sign in' : 'Create an Account'}</Button>
                    </form>
                </Form>

                <p className="text-center">
                    {isSignIn ? 'No account yet?' : 'Have an account already?'}
                    <Link href={!isSignIn ? '/sign-in' : '/sign-up'} className="font-bold text-user-primary ml-1">
                        {!isSignIn ? 'Sign in' : 'Sign in'}
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default AuthForm