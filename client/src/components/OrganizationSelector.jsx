import React, { useState, useEffect } from "react";
import { ChevronDown, Plus, Building2, Check, Settings } from "lucide-react";
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

    const isOwner = (org) => {
        return org.ownerId === user?.id;
    };

    const handleEditOrg = (e, org) => {
        e.stopPropagation();
        navigate(`/organizations/${org.id}/settings`);
        setIsOpen(false);
    };

    return (
        <div className="relative px-3 py-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                        <span className="font-semibold text-sm truncate text-gray-900">
                            {currentOrg ? currentOrg.name : "Select Organization"}
                        </span>
                        {currentOrg && (
                            <span className="text-xs text-gray-500">
                                {currentOrg._count?.members || 0} members
                            </span>
                        )}
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full left-3 right-3 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                        <div className="max-h-80 overflow-y-auto">
                            {organizations.map((org) => (
                                <div
                                    key={org.id}
                                    className="group relative"
                                >
                                    <button
                                        onClick={() => {
                                            onOrgChange(org);
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 text-left transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-bold text-gray-700">
                                                    {org.name[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex flex-col overflow-hidden flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900 truncate">
                                                        {org.name}
                                                    </span>
                                                    {isOwner(org) && (
                                                        <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded">
                                                            Owner
                                                        </span>
                                                    )}
                                                </div>
                                                {org.description && (
                                                    <span className="text-xs text-gray-500 truncate">
                                                        {org.description}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400">
                                                    {org._count?.members || 0} members · {org._count?.workspaces || 0} workspaces
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isOwner(org) && (
                                                <button
                                                    onClick={(e) => handleEditOrg(e, org)}
                                                    className="p-1.5 rounded-md hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Organization settings"
                                                >
                                                    <Settings className="w-4 h-4 text-gray-600" />
                                                </button>
                                            )}
                                            {currentOrg?.id === org.id && (
                                                <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 mt-1 pt-1">
                            <button
                                onClick={() => {
                                    navigate("/create-organization");
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-violet-600 hover:bg-violet-50 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create Organization
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
