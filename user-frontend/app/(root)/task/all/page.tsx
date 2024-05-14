"use client";
import { Appbar } from "@/components/Appbar";
import { BACKEND_URL } from "@/utils";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Data = {
  taskId: number;
  title: string;
  signature: string;
  done: boolean;
  options: Record<
    string,
    {
      count: number;
      imageUrl: string;
    }
  >;
}[];
async function getAllTasks() {
  const response = await axios.get(`${BACKEND_URL}/v1/user/task/all`, {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });
  return response.data as Data;
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Data>([]);
  useEffect(() => {
    getAllTasks()
      .then((data) => {
        setResult(data);
      })
      .catch((err) => {
        // @ts-ignore
        toast.error((err as AxiosError).response?.data.message);
      });

    setLoading(false);
  }, []);

  return (
    <div>
      <Appbar />
      {loading ? (
        <div className="h-screen flex justify-center flex-col">
          <div className="w-full flex justify-center text-2xl">Loading...</div>
        </div>
      ) : (
        result.map((task) => {
          return (
            <div className="flex flex-col gap-4 justify-center items-center ">
              <div className="text-2xl pt-20 flex flex-col justify-center w-1/2 items-center text-center">
                {task.title}
                <div>
                  <button className="m-2 mr-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                    <Link
                      className="cursor-pointer "
                      href={`https://explorer.solana.com/tx/${task.signature}`}
                    >
                      Transaction Signature
                    </Link>
                  </button>
                </div>
              </div>
              <div className="flex justify-center pt-8">
                {Object.keys(task.options || {}).map((optionId) => (
                  <Task
                    key={optionId}
                    imageUrl={task.options[optionId].imageUrl}
                    votes={task.options[optionId].count}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function Task({ imageUrl, votes }: { imageUrl: string; votes: number }) {
  return (
    <div>
      <img className={"p-2 w-96 rounded-md"} src={imageUrl} />
      <div className="flex justify-center">{votes}</div>
    </div>
  );
}
