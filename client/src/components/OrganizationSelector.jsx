import React, { useState, useEffect } from "react";
import { ChevronDown, Plus, Building2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OrganizationSelector({ user, currentOrg, onOrgChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [organizations, setOrganizations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch("http://localhost:3000/organizations", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setOrganizations(data);

            // Select first org if none selected
            if (!currentOrg && data.length > 0) {
                onOrgChange(data[0]);
            }
        } catch (error) {
            console.error("Error fetching organizations:", error);
        }
    };

    return (
        <div className="relative px-3 py-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-sm truncate text-gray-700">
                        {currentOrg ? currentOrg.name : "Select Organization"}
                    </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-3 right-3 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="max-h-60 overflow-y-auto">
                        {organizations.map((org) => (
                            <button
                                key={org.id}
                                onClick={() => {
                                    onOrgChange(org);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                                        <span className="text-xs font-bold text-gray-600">
                                            {org.name[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-700">{org.name}</span>
                                </div>
                                {currentOrg?.id === org.id && (
                                    <Check className="w-4 h-4 text-violet-600" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                            onClick={() => {
                                navigate("/create-organization");
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        >
                            <Plus className="w-4 h-4" />
                            Create Organization
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
