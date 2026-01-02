import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";
import MemberDetailSummary from "./MemberDetailSummary";

export default function MemberDetailList({ dongId, members = [] }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">{t("Member Details")}</h3>
      {members.length === 0 ? (
        <p className="text-gray-500">{t("No members in this group.")}</p>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className={`p-3 rounded-lg ${
                theme === "light" ? "bg-white" : "bg-gray-800"
              } shadow-sm`}
            >
              <h4 className="font-medium mb-2">{member.name}</h4>
              <MemberDetailSummary
                dongId={dongId}
                memberName={member.name}
                theme={theme}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
