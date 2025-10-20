"use client";

import { DialogTitle } from "@radix-ui/react-dialog";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import { Button } from "../ui/button";
import Image from "next/image";
import logo from "@/public/logo.svg";

export const FAQ = () => {
  return (
    <DialogContent className="bg-white md:w-[350px]">
      <DialogHeader>
        <DialogTitle className="flex gap-1 justify-center items-center font-bold text-center text-gray-800 mb-2">
          <Image src={logo} height={30} width={30} alt="logo" />{" "}
          <span> About This Platform</span>
        </DialogTitle>
        <div className=" bg-white rounded-xl max-w-sm mx-auto">
          {/* <h2 className="text-base font-bold text-center text-gray-800 mb-3">
            🏙️ Gondia Citizen Voice
          </h2> */}
          <div className="text-sm text-gray-600 mb-2 ">
            A chatbot platform where residents of Gondia can report issues,
            raise concerns, and take action together.
          </div>

          <div className="mb-2">
            {/* <h3 className="text-base font-semibold text-gray-800 mb-1 text-left">
              💬 What You Can Do
            </h3> */}
            <ul className="list-none text-sm text-gray-700 space-y-2 pl-0">
              <li>
                <strong>Submit Complaints:</strong> Quickly report issues like
                potholes, garbage, water supply, and more.
              </li>
              <li>
                <strong>Co-Sign Issues:</strong> Support complaints that matter
                to you.
              </li>
              <li>
                <strong>Get Updates:</strong> Stay informed about your
                submissions and progress.
              </li>
            </ul>
          </div>

          <div className="my-4">
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              🙌 Why This Matters
            </h3>
            <div className="text-sm text-gray-700">
              This platform brings Gondia citizens together to highlight issues
              and push for faster action by authorities.
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              🤖 Smart Chatbot
            </h3>
            <div className="text-sm text-gray-700">
              No forms - just chat naturally with our bot to file complaints
              easily.
            </div>
          </div>
        </div>
      </DialogHeader>
    </DialogContent>
  );
};
