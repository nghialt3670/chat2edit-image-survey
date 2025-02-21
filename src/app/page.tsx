"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSurveyResult } from "@/hooks/use-survey-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const { fullName, email, setFullName, setEmail } = useSurveyResult();
  const router = useRouter();

  return (
    <Card className="flex flex-col h-[calc(100vh-48px)] m-6">
      <CardHeader>
        <h1 className="text-2xl font-bold">Welcome to the Study</h1>
      </CardHeader>
      <CardContent className="h-full flex flex-col space-y-4 p-4 overflow-y-scroll">
        <p>
          This study consists of <strong>100 slides</strong>. Each slide presents a message to a chatbot that performs image editing. The message includes text and one or more images. Below each message, you will see different responses containing both text and images.
        </p>
        <p>
          Your task is to evaluate each response based on two criteria:
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Understanding the user&apos;s intent:</strong> Determine whether the chatbot correctly understands what the user is asking. If the response aligns with the intended request, mark it as <strong>Understood user&apos;s intent</strong>. Otherwise, mark it as <strong>Not understood user&apos;s intent</strong>.
          </li>
          <li className="mt-2">
            <strong>Goodness of the response:</strong> Assess whether the chatbot&apos;s response meets the user&apos;s request. If the response is useful and directly addresses the request, mark it as <strong>Good result</strong>. Otherwise, mark it as <strong>Bad result</strong>.
          </li>
        </ul>
        <p>Please enter your details to begin:</p>
        <Input
          type="text"
          placeholder="Your Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button disabled={!fullName || !email} onClick={() => router.push("/forms")}>
          Start
        </Button>
      </CardContent>
    </Card>
  );
}
