"use client";

import { Calendar, UserPlus, Users, ChevronDown } from "lucide-react";

export default function PlanNewTripForm() {
  return (
    // Container aligned with the width from the SVG viewbox (approx 493px content)

      
      <div className="flex flex-col items-start gap-[8px] w-[493px]">
        
        {/* Header Section */}
        <div className="flex flex-col items-center gap-[24px] w-full self-stretch">
          <h2 className="font-inter font-bold text-[36px] leading-[44px] text-center text-[#000000]">
            Plan a new trip
          </h2>

          {/* Inputs Wrapper */}
          <div className="flex flex-col items-start gap-[4px] w-full self-stretch">
            <div className="flex flex-col items-start gap-[16px] w-full self-stretch">
              
              {/* Destination Input */}
              <div className="box-border flex flex-row items-center px-[8px] py-[12px] gap-[10px] w-full h-[46px] border border-[#E0E0E0] rounded-[8px] bg-white">
                <input 
                  type="text" 
                  placeholder="Where to ? e.g. Thailand , India, Japan" 
                  className="w-full font-inter font-bold text-[18px] leading-[22px] text-[#000000] outline-none placeholder:text-[#9E9E9E]"
                />
              </div>

              {/* Date Selection Input */}
              <div className="box-border flex flex-col items-start px-[8px] py-[6px] w-full h-[46px] border border-[#E0E0E0] rounded-[8px] bg-white relative">
                 
                 {/* Label */}
                 <span className="font-inter font-bold text-[12px] leading-[15px] text-[#000000] mb-[2px]">
                    Dates (optional)
                 </span>

                 {/* Date Toggles */}
                 <div className="flex flex-row items-center w-full h-[16px] gap-[60px]">
                    
                    {/* Start Date */}
                    <button className="flex flex-row items-end gap-[8px] w-[81px] hover:opacity-70 group">
                        <Calendar className="w-[16px] h-[16px] text-[#212121]" />
                        <span className="font-inter font-normal text-[12px] leading-[15px] text-[#000000] whitespace-nowrap">
                            Start date
                        </span>
                    </button>

                    {/* Divider Line (Positioned absolutely to match SVG layout) */}
                    <div className="absolute left-[105px] top-[24px] w-[16px] h-[0px] border-[0.2px] border-black rotate-90"></div>

                    {/* End Date */}
                    <button className="flex flex-row items-end gap-[8px] w-[75px] hover:opacity-70 group">
                        <Calendar className="w-[16px] h-[16px] text-[#212121]" />
                        <span className="font-inter font-normal text-[12px] leading-[15px] text-[#000000] whitespace-nowrap">
                            End date
                        </span>
                    </button>

                 </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions Section */}
        <div className="flex flex-col items-center gap-[24px] w-full self-stretch mt-4">
            
            {/* Invite & Friends Row */}
            <div className="flex flex-row justify-between items-center w-full h-[24px]">
                
                {/* Invite Button */}
                <button className="flex flex-row items-center gap-[8px] hover:opacity-70 transition-opacity">
                    <div className="w-[16px] h-[16px] flex items-center justify-center">
                        <UserPlus className="w-[16px] h-[16px] text-[#9E9E9E]" />
                    </div>
                    <span className="font-inter font-normal text-[12px] leading-[15px] text-[#9E9E9E]">
                        Invite tripmates
                    </span>
                </button>

                {/* Friends Selector */}
                <button className="flex flex-row justify-between items-center px-[8px] py-[4px] gap-[8px] w-[125px] h-[24px] rounded-[8px] hover:bg-gray-100 transition-colors">
                    <div className="flex flex-row items-start gap-[6px]">
                        <Users className="w-[16px] h-[16px] text-[#212121]" />
                        <span className="font-inter font-normal text-[12px] leading-[15px] text-[#212121]">
                            Friends
                        </span>
                    </div>
                    <ChevronDown className="w-[16px] h-[16px] text-[#212121]" />
                </button>
            </div>

            {/* Start Planning Button */}
            <button className="box-border flex flex-row justify-center items-end px-[16px] py-[12px] gap-[8px] w-[112px] h-[39px] bg-[#3A82CE] border border-[#C2DCF3] rounded-[8px] hover:bg-[#3272b5] transition-colors shadow-sm">
                <span className="font-inter font-normal text-[12px] leading-[15px] text-[#FFFFFF]">
                    Start planning
                </span>
            </button>

        </div>

      </div>
  );
}