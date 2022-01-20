import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const date = format(
    new Date(post.first_publication_date),
    "dd ' ' MMM ' ' yyyy",
    { locale: ptBR }
  );

  const { content } = post.data;
  // const readTime = content.reduce()

  return (
    <>
      <Head>
        <title> {post?.data.title} </title>
      </Head>

      <main>
        <article>
          <h1>{post.data.title}</h1>
          <time>{date}</time>
          <p>{post.data.author}</p>
          <div />
          {/* <div
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: post.data.content,
            }}
          /> */}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'posts')
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.getByUID(
    'posts',
    String(context.params.slug),
    {}
  );

  return {
    props: { post: postsResponse },
    redirect: 60 * 30,
  };
};
