"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import _ from "lodash";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useSurveyResult } from "@/hooks/use-survey-result";
import { SurveyForm } from "@/components/survey-form";
import { Button } from "@/components/ui/button";
import { Message } from "@/interfaces/message";
import { useSearchParams } from "next/navigation";

const SOURCES = ["chat2edit", "gemini", "chatgpt"];
const N = 30;

export default function FormsPage() {
  const searchParams = useSearchParams();
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [requests, setRequests] = useState<Message[]>([]);
  const [srcToResponses, setSrcToResponses] = useState<
    Record<string, Message[]>
  >({});
  const { results } = useSurveyResult();

  const formIndex = searchParams.get("index");
  const fullName = searchParams.get("fullName");

  if (!formIndex || !fullName) {
    return undefined;
  }

  const readCsvToMessages = (text: string): Message[] => {
    const result = Papa.parse(text, { header: true });
    const rows = result.data as Record<string, any>[];
    return rows
      .map((row, idx) => ({
        id: idx.toString(),
        text: row.text,
        images: row.images ? row.images.split(";") : [],
      }))
      .slice(0, N);
  };

  const order = useMemo(() => {
    return _.shuffle(_.range(N));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsFetching(true);
      // Fetch requests
      const requestsText = await fetch(`/experiments/experiment${formIndex}/dataset/requests.csv`).then(
        (res) => res.text(),
      );
      const requests = readCsvToMessages(requestsText);

      // Fetch responses
      const srcToResponses: Record<string, Message[]> = {};
      for (const src of SOURCES) {
        const responsesText = await fetch(
          `/experiments/experiment${formIndex}/results/${src}/responses.csv`,
        ).then((res) => res.text());
        srcToResponses[src] = readCsvToMessages(responsesText);
      }

      // Ensure same shuffle order
      const shuffledRequests = order.map((i) => requests[i]);
      const shuffledSrcToResponses = Object.fromEntries(
        Object.entries(srcToResponses).map(([src, responses]) => [
          src,
          order.map((i) => responses[i]),
        ]),
      );

      setRequests(shuffledRequests);
      setSrcToResponses(shuffledSrcToResponses);
      setIsFetching(false);
    };

    loadData();
  }, []);

  const handleSubmit = async () => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/save`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        formIndex,
        fullName,
        results,
      }),
    });

    if (response.ok) {
      window.location.href = "/thanks";
    } else {
      console.error("Error submitting the form.");
    }
  };

  const canSubmit = !!fullName && Object.keys(results).length === requests.length;

  if (isFetching) {
    return undefined;
  }

  return (
    <main className="size-full flex flex-col items-center justify-center bg-slate-50">
      <Carousel className="w-full">
        <CarouselContent className="h-full">
          {requests.map((request, idx) => (
            <CarouselItem key={idx} className="h-full relative">
              <SurveyForm
                index={order[idx]}
                currIndex={idx}
                total={N}
                request={request}
                srcToResponse={Object.fromEntries(
                  Object.entries(srcToResponses).map(([src, responses]) => [
                    src,
                    responses[idx],
                  ]),
                )}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <Button onClick={handleSubmit} disabled={!canSubmit}>
        Submit
      </Button>
    </main>
  );
}
