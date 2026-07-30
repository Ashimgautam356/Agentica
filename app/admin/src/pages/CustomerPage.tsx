import { RiDeleteBin6Line, RiEdit2Line, RiSearchLine } from "@remixicon/react";
import { useMemo, useState } from "react";
import {
  useDeleteUser,
  useDeleteUserSession,
  useUpdateUser,
  useUpdateUserPassword,
  useUsers,
  type UserRecord,
} from "../api/admin";
import { DataTable } from "../components/DataTable";
import { CustomerModal } from "./CustomerModal";

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  image: string;
  sessionId: string;
  joined: string;
  actions: string;
};

const dummyCustomers: UserRecord[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    firstName: "Maya",
    lastName: "Gurung",
    email: "maya@example.com",
    imageId: "users/maya-gurung",
    createdAt: new Date().toISOString(),
    sessions: [
      {
        id: "aaaa1111-1111-4111-8111-111111111111",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 604_800_000).toISOString(),
        userAgent: "Chrome on macOS",
      },
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    firstName: "Aarav",
    lastName: "Sharma",
    email: "aarav@example.com",
    imageId: "users/aarav-sharma",
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    sessions: [
      {
        id: "bbbb2222-2222-4222-8222-222222222222",
        createdAt: new Date(Date.now() - 3_600_000).toISOString(),
        expiresAt: new Date(Date.now() + 604_800_000).toISOString(),
        userAgent: "Safari on iPhone",
      },
    ],
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    firstName: "Nisha",
    lastName: "Rai",
    email: "nisha@example.com",
    imageId: "users/nisha-rai",
    createdAt: new Date(Date.now() - 172_800_000).toISOString(),
    sessions: [],
  },
];

export function CustomerPage({ syncedAt }: { syncedAt: string }) {
  const users = useUsers();
  const updateUser = useUpdateUser();
  const updatePassword = useUpdateUserPassword();
  const deleteUser = useDeleteUser();
  const deleteSession = useDeleteUserSession();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const userList = users.data?.length ? users.data : dummyCustomers;

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return userList
      .filter((user) => {
        if (!query) {
          return true;
        }

        return [getFullName(user), user.email ?? "", user.imageId ?? "", getSessionId(user)]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .map((user) => ({
        id: user.id,
        name: getFullName(user),
        email: user.email ?? "-",
        image: user.imageId ?? "-",
        sessionId: getSessionId(user),
        joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-",
        actions: "",
      }));
  }, [search, userList]);

  const error =
    users.error ??
    updateUser.error ??
    updatePassword.error ??
    deleteUser.error ??
    deleteSession.error;

  function closeModal() {
    setEditing(null);
  }

  function isRealUser(id: string) {
    return Boolean(users.data?.some((user) => user.id === id));
  }

  return (
    <>
      <section className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase text-[#34A85B]">User Management</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#241F14]">Customer list</h2>
            <p className="mt-2 text-sm font-semibold text-[#8A8172]">Last synced at {syncedAt}</p>
          </div>
          <label className="flex min-h-11 min-w-80 items-center gap-2 rounded-lg border border-[#EFE7D8] bg-white px-3 text-sm font-semibold text-[#6A717F] max-sm:min-w-0 max-sm:w-full">
            <RiSearchLine size={18} />
            <input
              className="min-w-0 flex-1 bg-transparent text-[#241F14] outline-none placeholder:text-[#8A8172]"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers"
              type="search"
              value={search}
            />
          </label>
        </div>

        {error ? <InlineError error={error as Error} /> : null}

        <article className="min-w-0 rounded-lg border border-[#EFE7D8] bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase text-[#34A85B]">Accounts</p>
              <h3 className="mt-1 text-lg font-extrabold text-[#241F14]">Customers</h3>
            </div>
            <span className="rounded-lg bg-[#EAF5EC] px-3 py-2 text-xs font-extrabold text-[#34A85B]">
              {rows.length} items
            </span>
          </div>

          {users.isLoading ? (
            <p className="m-0 text-sm font-semibold text-[#8A8172]">Loading customers...</p>
          ) : null}
          {!users.isLoading && rows.length === 0 ? (
            <p className="m-0 text-sm font-semibold text-[#8A8172]">No customers found.</p>
          ) : (
            <DataTable<CustomerRow>
              rows={rows}
              columns={[
                {
                  key: "name",
                  label: "Customer",
                  render: (row) => (
                    <CustomerCell email={row.email} image={row.image} name={row.name} />
                  ),
                },
                {
                  key: "sessionId",
                  label: "Session ID",
                  render: (row) => (
                    <SessionCell
                      disabled={deleteSession.isPending || row.sessionId === "-"}
                      onDelete={() => {
                        if (isRealUser(row.id) && row.sessionId !== "-") {
                          deleteSession.mutate({ userId: row.id, sessionId: row.sessionId });
                        }
                      }}
                      sessionId={row.sessionId}
                    />
                  ),
                },
                { key: "joined", label: "Joined" },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => {
                    const user = userList.find((item) => item.id === row.id);

                    return (
                      <CustomerActions
                        disabled={deleteUser.isPending}
                        onDeleteUser={() => {
                          if (isRealUser(row.id)) {
                            deleteUser.mutate(row.id);
                          }
                        }}
                        onEdit={() => {
                          if (user) {
                            setEditing(user);
                          }
                        }}
                      />
                    );
                  },
                },
              ]}
            />
          )}
        </article>
      </section>

      {editing ? (
        <CustomerModal
          customer={editing}
          isSaving={updateUser.isPending || updatePassword.isPending}
          onClose={closeModal}
          onPasswordSubmit={(input) => {
            if (isRealUser(editing.id)) {
              updatePassword.mutate({ id: editing.id, input });
            }
          }}
          onSubmit={(input) => {
            if (isRealUser(editing.id)) {
              updateUser.mutate({ id: editing.id, input }, { onSuccess: closeModal });
              return;
            }

            closeModal();
          }}
        />
      ) : null}
    </>
  );
}

function CustomerCell({ email, image, name }: { email: string; image: string; name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-w-56 items-center gap-3">
      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#EAF5EC] text-sm font-extrabold text-[#34A85B]">
        {image.startsWith("http") ? (
          <img alt={name} className="size-full object-cover" src={image} />
        ) : (
          initials
        )}
      </span>
      <div className="min-w-0">
        <p className="m-0 truncate text-sm font-extrabold text-[#241F14]">{name}</p>
        <p className="m-0 truncate text-xs font-semibold text-[#8A8172]">{email}</p>
        <p className="m-0 truncate text-xs font-semibold text-[#8A8172]">{image}</p>
      </div>
    </div>
  );
}

function SessionCell({
  disabled,
  onDelete,
  sessionId,
}: {
  disabled?: boolean;
  onDelete: () => void;
  sessionId: string;
}) {
  return (
    <div className="flex min-w-64 items-center gap-2">
      <button
        aria-label="Delete session id"
        className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#F3C8C2] bg-[#FFF0EE] text-[#D9584A] transition-[background-color,transform] duration-150 hover:bg-[#FBE0DD] active:scale-95 disabled:opacity-50"
        disabled={disabled}
        onClick={onDelete}
        type="button"
      >
        <RiDeleteBin6Line size={16} />
      </button>
      <span className="truncate text-sm font-semibold text-[#6A717F]">{sessionId}</span>
    </div>
  );
}

function CustomerActions({
  disabled,
  onDeleteUser,
  onEdit,
}: {
  disabled?: boolean;
  onDeleteUser: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        aria-label="Edit customer"
        className="grid size-10 place-items-center rounded-lg border border-[#DDEFE1] bg-[#EAF5EC] text-[#34A85B] transition-[background-color,transform] duration-150 hover:bg-[#DDEFE1] active:scale-95"
        onClick={onEdit}
        type="button"
      >
        <RiEdit2Line size={18} />
      </button>
      <button
        aria-label="Delete customer"
        className="grid size-10 place-items-center rounded-lg border border-[#F3C8C2] bg-[#FFF0EE] text-[#D9584A] transition-[background-color,transform] duration-150 hover:bg-[#FBE0DD] active:scale-95 disabled:opacity-60"
        disabled={disabled}
        onClick={onDeleteUser}
        type="button"
      >
        <RiDeleteBin6Line size={18} />
      </button>
    </div>
  );
}

function getFullName(user: UserRecord) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Customer";
}

function getSessionId(user: UserRecord) {
  return user.sessions?.[0]?.id ?? "-";
}

function InlineError({ error }: { error: Error }) {
  return (
    <div className="rounded-lg border border-[#F3C8C2] bg-[#FFF0EE] px-4 py-3 text-sm font-semibold text-[#D9584A]">
      {error.message}
    </div>
  );
}
