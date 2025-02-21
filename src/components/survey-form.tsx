import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import _ from "lodash";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useSurveyResult } from "@/hooks/use-survey-result";
import { Message as IMessage } from "@/interfaces/message";
import { useCarousel } from "./ui/carousel";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

interface SurveyFormProps {
  index: number;
  request: IMessage;
  srcToResponse: Record<string, IMessage>;
}

export function SurveyForm({ index, request, srcToResponse }: SurveyFormProps) {
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const { canScrollPrev, scrollPrev, canScrollNext, scrollNext } =
    useCarousel();

  const [srcToJudgement, setSrcToJudgement] = useState<Record<string, string>>(
    {},
  );
  const { setResults } = useSurveyResult();

  useEffect(() => {
    if (Object.keys(srcToResponse).every(src => src in srcToJudgement)) {
      setResults(index, srcToJudgement);
    }
  }, [srcToJudgement, index]);

  const suffledSrcToResponse = useMemo(() => {
    return Object.fromEntries(_.shuffle(Object.entries(srcToResponse)))
  }, [])

  const keys1 = Object.keys(Object.fromEntries(Object.entries(srcToResponse).filter(([_, response]) => response.text)));
  const keys2 = Object.keys(srcToJudgement);
  const isAllJudged =
    keys1.length * 2 === keys2.length;

  return (
    <>
      {/* Zoom Modal inside Card Content, no fixed positioning */}
      {fullScreenImage && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full">
            <img
              src={fullScreenImage}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking the image
            />
            <Button
              variant="ghost"
              className="absolute top-4 right-4 size-10 bg-white/80 rounded-full"
              onClick={() => setFullScreenImage(null)}
            >
              <X size={20} />
            </Button>
          </div>
        </div>
      )}

      {/* Main Card */}
      <Card className="h-[calc(100vh-100px)] flex flex-col m-6">
        <CardContent className="h-full flex flex-col space-y-4 p-4 overflow-y-scroll">
          <div className="w-full md:w-1/3 h-fit ml-auto border-none p-4">
            <div className="flex flex-col space-y-2 ml-auto w-fit">
              {/* Request Images (Keep Original Sizing) */}
              <div className="flex flex-col space-y-2 ml-auto">
                {request.images.map((image) => (
                  <div key={image} className="relative">
                    <img
                      className="rounded-lg cursor-pointer ml-auto w-full"
                      src={`/experiment/dataset/images/${image}`}
                      onClick={() =>
                        setFullScreenImage(
                          `/experiment/dataset/images/${image}`,
                        )
                      }
                    />
                    <Button
                      variant="ghost"
                      className="absolute top-2 right-2 size-8 p-1 bg-white/80 rounded-full"
                      onClick={() =>
                        setFullScreenImage(
                          `/experiment/dataset/images/${image}`,
                        )
                      }
                    >
                      <Expand size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Request Text */}
              <ReactMarkdown className="w-fit rounded-lg px-3 py-2 bg-muted ml-auto">
                {request.text}
              </ReactMarkdown>
            </div>
          </div>

          <Separator className="h-0.5" />

          {/* Response Cards */}
          <div className="flex flex-col md:flex-row w-full gap-4 justify-evenly">
            {Object.entries(suffledSrcToResponse)
              .filter(([_, response]) => response?.text)
              .map(([src, response], idx) => (
                <Card
                  key={`${response.text}_${response.images.join(";")}_${idx}`}
                  className="w-full md:w-1/3 h-fit bg-muted relative"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      <div>
                        {response.images.map((image) => (
                          <div key={image} className="relative">
                            <img
                              className="w-full h-auto rounded-lg cursor-pointer"
                              src={`/experiment/results/${src}/images/${image}`}
                              onClick={() =>
                                setFullScreenImage(
                                  `/experiment/results/${src}/images/${image}`,
                                )
                              }
                            />
                            <Button
                              variant="ghost"
                              className="absolute top-2 right-2 size-8 p-1 bg-white/80 rounded-full"
                              onClick={() =>
                                setFullScreenImage(
                                  `/experiment/results/${src}/images/${image}`,
                                )
                              }
                            >
                              <Expand size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <ReactMarkdown className="w-full font-semibold">
                        {response.text}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <RadioGroup
                      onValueChange={(value) =>
                        setSrcToJudgement((prev) => ({ ...prev, [`${src}-understanding`]: value }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="relevant" id="r1" />
                        <Label
                          htmlFor="r1"
                          className={
                            srcToJudgement[src]
                              ? srcToJudgement[src] == "understood"
                                ? "text-green-600"
                                : "text-green-200"
                              : "text-green-400"
                          }
                        >
                          Understood user's intent
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="irrelevant" id="r2" />
                        <Label
                          htmlFor="r2"
                          className={
                            srcToJudgement[src]
                              ? srcToJudgement[src] == "not-understood"
                                ? "text-red-600"
                                : "text-red-200"
                              : "text-red-400"
                          }
                        >
                          Not understood user's intent
                        </Label>
                      </div>
                    </RadioGroup>
                    <RadioGroup
                      onValueChange={(value) =>
                        setSrcToJudgement((prev) => ({ ...prev, [`${src}-relevance`]: value }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="relevant" id="r1" />
                        <Label
                          htmlFor="r1"
                          className={
                            srcToJudgement[src]
                              ? srcToJudgement[src] == "relevant"
                                ? "text-green-600"
                                : "text-green-200"
                              : "text-green-400"
                          }
                        >
                          Relevant result
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="irrelevant" id="r2" />
                        <Label
                          htmlFor="r2"
                          className={
                            srcToJudgement[src]
                              ? srcToJudgement[src] == "irrelevant"
                                ? "text-red-600"
                                : "text-red-200"
                              : "text-red-400"
                          }
                        >
                          Irrelevant result
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </CardContent>
        <Separator className="h-0.5" />
        <CardFooter className="pt-4">
          <div className="w-full flex flex-row justify-between">
            <Button disabled={!canScrollPrev} onClick={scrollPrev}>
              <ArrowLeft />
              Previous
            </Button>
            <Button
              disabled={!canScrollNext || !isAllJudged}
              onClick={scrollNext}
              >
              Next
              <ArrowRight />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
