const ArticleContent = ({ pageContent }: { pageContent: string }) => {
  return (
    <div className="prose w-full prose-invert md:pl-10 md:py-10 py-5 mb-10 text-[#FAF0E6]">
      <div dangerouslySetInnerHTML={{ __html: pageContent }}></div>
    </div>
  );
};

export default ArticleContent;
