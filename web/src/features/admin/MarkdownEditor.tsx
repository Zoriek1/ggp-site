"use client";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  toolbarPlugin,
  markdownShortcutPlugin,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { editorLocale } from "./editor-locale";

export default function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <MDXEditor
      markdown={value}
      onChange={onChange}
      translation={(key, fallback, values) =>
        Object.entries(values || {}).reduce(
          (text, [name, value]) =>
            text.replaceAll(`{{${name}}}`, String(value)),
          editorLocale[key] || fallback,
        )
      }
      contentEditableClassName="prose reading-body editor-prose"
      placeholder="Escreva o conteúdo aqui…"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        tablePlugin(),
        imagePlugin({
          imageUploadHandler: async (file) => {
            const form = new FormData();
            form.set("file", file);
            const response = await fetch("/api/admin/uploads", {
              method: "POST",
              body: form,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data.url;
          },
        }),
        diffSourcePlugin({ viewMode: "rich-text" }),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <BlockTypeSelect />
              <ListsToggle />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertThematicBreak />
            </DiffSourceToggleWrapper>
          ),
        }),
      ]}
    />
  );
}
