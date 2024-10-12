// models/Post.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';
import User from './User';

interface PostAttributes {
  id: number;
  userId: number;
  content: string;
}

interface PostCreationAttributes extends Optional<PostAttributes, 'id'> {}

class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  public id!: number;
  public userId!: number;
  public content!: string;

  // タイムスタンプ
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    content: {
      type: new DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'posts',
    sequelize,
  }
);

// リレーションを定義
Post.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Post, {
  sourceKey: 'id',
  foreignKey: 'userId',
  as: 'posts',
});

export default Post;
